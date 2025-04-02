import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { TableData } from '@nielsen-media/maf-fc-table2'
import { useDataContext } from '../../../lib/context/static-data'
import { isEmpty } from '../../../lib/utils/shared'
import Flex from '@nielsen-media/maf-fc-flex'
import { Loading } from '../../../lib/global/components'
import { updateEditedForms, updateEditedFormsTEMP, submitFormEdits, submitFormEditsTEMP } from '../../../lib/maf-api/api-form-data'
import { format, toZonedTime } from 'date-fns-tz'

export interface FormChange {
  form_id: number
  field_id: number
  field_name: string
  old_value: any
  new_value: any
}

export interface QAAuditTransaction {
  record_number: number
  app_id: number
  audit_track: number[]
  field_id: number
  field_name: string
  old_value: string
  new_value: string
  created_by: string
  transaction_date: string
}

// Custom hook function to generate audit transactions list and format edited forms for submission 
export function useMakeEditSubmission(qr:string, appID:number, mode:"single" | "bulk", forms:TableData[]|TableData, changes:FormChange[], auditTracking:number[]) {
  const finalForms: [] = mode === "single"
    ? [{ ...forms, app_id: appID, created_by: qr, updated_by: qr, updated_date: format(toZonedTime(new Date(), 'America/Chicago'), 'yyyy-MM-dd HH:mm:ss')}] // CST timezone
    : forms.map((form) => {
      return { 
        ...form, 
        app_id: appID,
        updated_by: `${qr}`,
        updated_date: format(toZonedTime(new Date(), 'America/Chicago'), 'yyyy-MM-dd HH:mm:ss') // CST timezone
      }
    })
  
  const finalChanges = changes.map((change) => {
    const updatedChange: QAAuditTransaction = {
      record_number: change.form_id,
      app_id: appID,
      audit_track: auditTracking,
      field_id: change.field_id,
      field_name: change.field_name,
      old_value: change.old_value,
      new_value: change.new_value,
      created_by: `${qr}`,
      transaction_date: format(toZonedTime(new Date(), 'America/Chicago'), 'yyyy-MM-dd HH:mm:ss') // CST timezone
    }
    return updatedChange
  })

  return {finalForms, finalChanges}
}

interface EditContextProps {
  qr: string
  editMode: "single" | "bulk"
  setEditMode: (mode: "single" | "bulk") => void
  auditTracking: number[]
  setAuditTracking: (audit: number[]) => void
  riID: string | null
  setRI: (ri: string) => void
  recordNumber: string | null
  setRecordNumber: (number: string) => void
  recordDate: string | null
  setRecordDate: (date: string) => void
  filterError: boolean
  setFilterError: (error: boolean) => void
  originalFormData: TableData | TableData[]
  setOriginalFormData: (forms: TableData[]) => void
  forms: TableData[]
  setForms: (forms: TableData[]) => void
  form: TableData
  setForm: (form: TableData) => void
  isRendering: boolean
  setRenderState: (state: boolean) => void
  formChanges: FormChange[]
  setFormChanges: (change: []) => void
  updateFormChange: (name:string, newValue: any) => void
  updateBulkFormChange: (formID: number, name:string, newValue: any) => void
  reset: () => void
  clearAllEdits: () => void
  isSuccessful: boolean
  setIsSuccessful: (status: boolean) => void
  saveFormsAndTransactions: (finalForms: any, finalChanges: QAAuditTransaction[]) => Promise<{formResponse: any, transactionResponse: any}>
}

// Create the context to track the editing of a single form or multiple forms
const EditFormsContext = createContext<EditContextProps>(null)

// ------------------------------------------------------------------------------- //

// Main Edit Context Provider for each step (Choose Method, Edit Forms, Save Forms)

export const EditProvider = ({ qr, appID, children }:{ qr:string, appID:number, children:ReactNode }) => {
  const [dataLoaded, setDataLoaded] = useState(false)
  const { dropdowns, formFields, skipLogicList } = useDataContext() // Get all dropdown, formFields, and skip logic lists
  useEffect(() => { // check if all static data has been loaded
    const allDropdownsHaveData = Object.values(dropdowns).every((list) => !isEmpty(list))
    const allFieldsHaveData = Object.values(formFields).every((list) => !isEmpty(list)) 
    if (allDropdownsHaveData && allFieldsHaveData && skipLogicList.length > 0) setDataLoaded(true)
  }, [dropdowns, formFields, skipLogicList])

  // Global edit states
  const [editMode, setEditMode] = useState<"single"|"bulk">(undefined)
  const [auditTracking, setAuditTracking] = useState<number[]>([])
  const [recordNumber, setRecordNumber] = useState<string>('')
  const [recordDate, setRecordDate] = useState<string>('')
  const [riID, setRI] = useState<string>('')
  const [filterError, setFilterError] = useState<boolean>(false)
  const [isRendering, setRenderState] = useState<boolean>(true)
  const [originalFormData, setOriginalFormData] = useState<TableData|TableData[]>(null)
  const [forms, setForms] = useState<TableData[]>([]) // current forms data with edits
  const [form, setForm] = useState<TableData>([]) // current form data with edits
  const [formChanges, setFormChanges] = useState<FormChange[]>([])

  // Setter method for storing form changes in single mode
  const updateFormChange = (name: string, newValue: string | number | null | boolean) => {
    const updatedNewValue = (typeof newValue === 'string' && newValue === "") ? null : newValue // replace empty strings with null
    const originalValue = originalFormData[name]
    setForm((prevForm) => {
      // only update if the value has actually changed
      if (updatedNewValue === originalValue) {
        if (typeof updatedNewValue === 'boolean') {
          // delete form change if present but update the field value
          setFormChanges((prevChanges) => prevChanges.filter(change => change.field_name !== name))
          return { ...prevForm, [name]: updatedNewValue }
        }
        return prevForm
      }
      else {
        // if previously changed, update form change details
        setFormChanges((prevChanges) => {
          const prevChangeNdx = prevChanges.findIndex(change => change.field_name === name)
          if (prevChangeNdx !== -1) {
            prevChanges[prevChangeNdx].new_value = updatedNewValue
            return prevChanges
          }

          // Add new form change entry
          return [ ...prevChanges,
            {
              form_id: form.record_number,
              field_id: formFields[appID].find(field => field.label === name)?.id,
              field_name: name,
              old_value: originalValue,
              new_value: updatedNewValue
            }
          ]
        })

        return { ...prevForm, [name]: updatedNewValue }
      }
    })
  }

  // Setter method for storing form changes in bulk mode
  const updateBulkFormChange = (formID: number, name: string, newValue: string | number | null | boolean) => {
    const updatedNewValue = (typeof newValue === 'string' && newValue === "") ? null : newValue // replace empty strings with null
    const originalValue = originalFormData.find(form => form.record_number === formID)[name]
    setForms((prevForms) => {
      return prevForms.map((form) => {
        if (form.record_number === formID) {
          // only update if the value has actually changed
          if (updatedNewValue === originalValue) {
            if (typeof updatedNewValue === 'boolean') {
              // delete form change if present but update the field value
              setFormChanges((prevChanges) => prevChanges.filter(change => change.form_id !== formID && change.field_name !== name))
              return { ...form, [name]: updatedNewValue }
            }
            return form
          } else {
            // if previously changed, update form change details
            setFormChanges((prevChanges) => {
              const prevChangeNdx = prevChanges.findIndex(change => change.form_id === formID && change.field_name === name)
              if (prevChangeNdx !== -1) {
                prevChanges[prevChangeNdx].new_value = updatedNewValue
                return prevChanges
              }

              // Add new form change entry
              return [
                ...prevChanges,
                { 
                  form_id: formID,
                  field_id: formFields[appID].find(field => field.label === name)?.id,
                  field_name: name,
                  old_value: originalValue,
                  new_value: updatedNewValue
                }
              ]
            })

            return { ...form, [name]: updatedNewValue}
          }
        }

        return form
      })
    })
  }

  // Start entire edit forms process over
  const reset = () => {
    setForm([])
    setRecordNumber('')
    setForms([])
    setRecordDate('')
    setRI('')
    setOriginalFormData(null)
    setAuditTracking([])
    setFilterError(false)
    setFormChanges([])
  }

  // Clear all form changes
  const clearAllEdits = () => {
    if (editMode === "single") setForm(originalFormData)
    if (editMode === "bulk") setForms(originalFormData)
    setFormChanges([])
  }

  // Global submit event
  const [isSuccessful, setIsSuccessful] = useState<boolean>(null)
  const saveFormsAndTransactions = async (finalForms: any, finalChanges: QAAuditTransaction[]) => {
    try {
      let formResponse = null
      let transactionResponse = null
  
      // Save forms
      formResponse = await updateEditedFormsTEMP(finalForms) // updateEditedForms(finalForms)
      
      // Save transactions only if form saves were successful
      if (formResponse) {
        if (formResponse.status <= 300) transactionResponse = await submitFormEditsTEMP(finalChanges) // submitFormEdits(finalChanges)
      }
      return { formResponse, transactionResponse } // Return both responses
    } catch (error) {
      console.error("Error saving forms or transactions: ", error)
      return { formResponse: null, transactionResponse: null }
    }
  }

  // loading state
  if (!dataLoaded) return <Flex justifyContent='center' alignContent='center'><Loading className="content-loading" /></Flex>
  
  return (
    <EditFormsContext.Provider 
      value={{
        qr: qr,
        editMode,
        setEditMode,
        auditTracking,
        setAuditTracking,
        riID,
        setRI,
        recordNumber,
        setRecordNumber,
        recordDate,
        setRecordDate,
        filterError,
        setFilterError,
        originalFormData,
        setOriginalFormData,
        form,
        setForm,
        forms,
        setForms,
        isRendering,
        setRenderState,
        formChanges,
        setFormChanges,
        updateFormChange,
        updateBulkFormChange,
        reset,
        clearAllEdits,
        saveFormsAndTransactions,
        isSuccessful,
        setIsSuccessful
      }}
    >
      {dataLoaded && children}
    </EditFormsContext.Provider>
  )
}

// Custom hook to use the form context
export const useEditContext = () => {
  const context = useContext(EditFormsContext)
  if (!context) throw new Error("useEditContext must be used within a EditProvider")
  return context
}