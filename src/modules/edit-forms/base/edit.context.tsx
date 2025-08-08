import { createContext, useContext, useState, FC, useMemo } from 'react'
import { TableData } from '@nielsen-media/maf-fc-table2'
import { useDataContext } from '../../../lib/context/data.context'
import Flex from '@nielsen-media/maf-fc-flex'
import { updateEditedForms, deleteForms, submitFormEdits } from '../../../lib/maf-api/services/qa.service'
import { Apps, FormError } from '../../../lib/types/forms.types'
import { sleep } from '../../../lib/utils/helpers'
import { Loading } from '../../../lib/components/feedback/LoaderSpinner'
import { EditMode, FormChange, QAAuditTransaction } from '../../../lib/types/edit.types'
import axios from 'axios'
import { emailErrorReport } from '../../../lib/maf-api/services/email.service'
import { validateForms } from '../../../lib/utils/qa/validateQA'
import { useMAFContext } from '../../../maf-api'

export interface EditContextProps {
    qr: string
    appID: keyof Apps
    editMode: EditMode
    setEditMode: (mode: EditMode) => void
    auditTracking: number[]
    setAuditTracking: (audit: number[]) => void
    riID: string | null
    setRI: (ri: string) => void
    recordNumber: string | null
    setRecordNumber: (number: string) => void
    recordDate: string | null
    setRecordDate: (date: string) => void
    filterError: boolean
    renderError: boolean
    setRenderError: (error: boolean) => void
    formErrors: FormError[]
    originalFormData: TableData | TableData[]
    forms: TableData[]
    form: TableData
    setFormData: (data: TableData | TableData[]) => void
    formChanges: FormChange[]
    updateFormChange: (name:string, value: any) => void
    updateBulkFormChange: (formID: number, name:string, newValue: any) => void
    selectBulkEdit: boolean
    setSelectBulkEdit: (status: boolean) => void
    reset: () => void
    clearAllEdits: () => void
    isSaving: boolean
    saveSubmitProgress: number
    submitActionMessage: string
    isSuccessful: boolean
    setIsSuccessful: (status: boolean) => void
    saveForms: (forms: any[]) => Promise<number[]>
    deleteFormIDs: (ids: number[]) => Promise<number[]>
    submitTransactions: (audits: QAAuditTransaction[]) => Promise<number[]>
    submissionMessage: string
    cancelSave: () => void
    exit: () => void
}

// Create the context to track the editing of a single form or multiple forms
const EditFormsContext = createContext<EditContextProps>(null)

// ------------------------------------------------------------------------------- //

// Main Edit Context Provider for each step (Choose Method, Edit Forms, Save Forms)

export const EditProvider: FC = ({ children }) => {
    const { actions: { navigate } } = useMAFContext()
    const { currentUser, dataLoaded, formFields } = useDataContext()

    // Global edit states
    const [appID, setAppID] = useState<keyof Apps>(1001) // undefined)
    const [editMode, setEditMode] = useState<"single"|"bulk">(undefined)
    const [auditTracking, setAuditTracking] = useState<number[]>([])
    const [recordNumber, setRecordNumber] = useState<string>('')
    const [recordDate, setRecordDate] = useState<string>('')
    const [riID, setRI] = useState<string>('')
    const [renderError, setRenderError] = useState<boolean>(false)
    const [originalFormData, setOriginalFormData] = useState<TableData|TableData[]>(null)
    const [forms, setForms] = useState<TableData[]>([]) // current forms data with edits
    const [form, setForm] = useState<TableData>([]) // current form data with edits
    const [formChanges, setFormChanges] = useState<FormChange[]>([])
    const [selectBulkEdit, setSelectBulkEdit] = useState<boolean>(false)
    
    // Check if the entered record number is a valid number (for single edit mode only)
    const filterError: boolean = useMemo(() => {
        if (editMode === 'single' && recordNumber.length > 0) return !/^[0-9]+$/.test(recordNumber)
        return false
    }, [editMode, recordNumber])

    // Compute a memoized array of form errors
    const formErrors: FormError[] = useMemo(() => {
        if (editMode === 'single') return validateForms(appID, [], [form])
        else return validateForms(appID, [], forms)
    }, [appID, editMode, form, forms])

    // Setter method for Form Data based on the edit mode
	const setFormData = (data: TableData | TableData[]) => {
        setOriginalFormData(data)

        if (editMode === 'single') setForm(data)
        else setForms(data)
	}

    // Setter method for storing form changes in single mode
    const updateFormChange = (name: string, newValue: string | number | null | boolean) => {
        const updatedNewValue = (typeof newValue === 'string' && newValue === "") ? null : newValue // replace empty strings with null
        const originalValue = originalFormData[name]

        setForm((prevForm) => {
            // only update if the value has actually changed
            if (updatedNewValue === originalValue) { // delete form change if present
                setFormChanges((prevChanges) => prevChanges.filter(change => change.field_name !== name))
            } else {
                setFormChanges((prevChanges) => {
                    const prevChangeNdx = prevChanges.findIndex(change => change.field_name === name)
                    if (prevChangeNdx !== -1) { // if previously changed, update form change details
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
            }

            return { ...prevForm, [name]: updatedNewValue }
        })
    }

    // Setter method for storing form changes in bulk mode
    const updateBulkFormChange = (formID: number, name: string, newValue: string | number | null | boolean) => {
        const updatedNewValue = (typeof newValue === 'string' && newValue === "") ? null : newValue // replace empty strings with null
        const originalValue = originalFormData.find(form => form.record_number === formID)[name]
        console.log("original, updated", originalValue, typeof originalValue, updatedNewValue, typeof updatedNewValue)

        setForms((prevForms) => {
            if (newValue === "FORM DELETED") {
                setFormChanges((prevChanges) => 
                    ([
                        ...prevChanges,
                        { 
                            form_id: formID,
                            field_id: null,
                            field_name: null,
                            old_value: null,
                            new_value: "FORM DELETED"
                        }
                    ])
                )
                return prevForms.filter((form) => form.record_number !== formID)
            }

            return prevForms.map((form) => {
                if (form.record_number === formID) {
                    // only update if the value has actually changed
                    if (updatedNewValue === originalValue) { // delete form change if present
                        console.log("same value")
                        setFormChanges((prevChanges) => prevChanges.filter(change => change.form_id !== formID && change.field_name !== name))
                    } else {
                        setFormChanges((prevChanges) => {
                            const prevChangeNdx = prevChanges.findIndex(change => change.form_id === formID && change.field_name === name)
                            if (prevChangeNdx !== -1) { // if previously changed, update form change details
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
                    }

                    return { ...form, [name]: updatedNewValue}
                }

                return form
            })
        })
    }

    // Clear all form changes
    const clearAllEdits = () => {
        if (editMode === "single") setForm(originalFormData)
        if (editMode === "bulk") setForms(originalFormData)
        setFormChanges([])
    }

    // Global submit event
    const BATCHSIZE = 2
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [saveSubmitProgress, setSaveSubmitProgress] = useState<number>(0)
    const [submissionMessage, setSubmissionMessage] = useState<string>("")
    const [submitActionMessage, setSubmitActionMessage] = useState<string>("")
    const [isSuccessful, setIsSuccessful] = useState<boolean>(null)

    const saveForms = async (finalForms: any[]) => {
        console.log("Form(s) to be saved: ", finalForms)
        setSubmitActionMessage("Saving forms...")

        try {
            let totalSavedIDs = []
            setIsSaving(true)

            for (let i = 0; i < finalForms.length; i += BATCHSIZE) {
                const batchNumber = (i / BATCHSIZE) + 1
                const batch = finalForms.slice(i, i + BATCHSIZE)
                const batchIDs: number[] = batch.map(form => form.record_number)
                const isLastBatch = (i + BATCHSIZE >= finalForms.length)

                console.log(`Processing batch number ${batchNumber}:`, batch)
                await updateEditedForms(appID, batch)

                setSaveSubmitProgress((prev) => prev += batchIDs.length)
                console.log(`Successfully saved batch ${batchNumber}.`)
                totalSavedIDs.push(...batchIDs)

                if (!isLastBatch) { // No need to sleep after the very last batch
                    console.log(`Pausing for 500ms before next batch...`)
                    await sleep(500) // Wait for 500 milliseconds
                }

                if (isLastBatch) {
                    console.log("All form(s) have been saved successfully.", totalSavedIDs)
                }
            }

            console.log(`${totalSavedIDs.length} form(s) saved.`)
            return totalSavedIDs
        } catch (error) { onSubmitError(error, 'save form(s)') }
    }

    const deleteFormIDs = async (deletions: number[]) => {
        console.log("Form(s) to be deleted: ", deletions)
        setSubmitActionMessage("Deleting forms...")

        try {
            let totalDeletedIDs = []
            setIsSaving(true)

            for (let i = 0; i < deletions.length; i += BATCHSIZE) {
                const batchNumber = (i / BATCHSIZE) + 1
                const batch = deletions.slice(i, i + BATCHSIZE)
                const isLastBatch = (i + BATCHSIZE >= deletions.length)

                console.log(`Processing batch number ${batchNumber}:`, batch)
                await deleteForms(appID, batch)

                setSaveSubmitProgress((prev) => prev += batch.length)
                console.log(`Successfully deleted batch ${batchNumber}.`)
                totalDeletedIDs.push(...batch)

                if (!isLastBatch) { // No need to sleep after the very last batch
                    console.log(`Pausing for 500ms before next batch...`)
                    await sleep(500) // Wait for 500 milliseconds
                }

                if (isLastBatch) {
                    console.log("All form(s) have been deleted successfully.", totalDeletedIDs)
                }
            }

            console.log(`${totalDeletedIDs.length} form(s) deleted.`)
            return totalDeletedIDs
        } catch (error) { onSubmitError(error, 'delete form(s)') }
    }

    const submitTransactions = async (finalChanges: QAAuditTransaction[]) => {        
        console.log("Audit transactions to be submitted: ", finalChanges)
        setSubmitActionMessage("Submitting edit transactions...")

        try {
            let totalSubmittedAudits = []
            setIsSaving(true)

            for (let i = 0; i < finalChanges.length; i += BATCHSIZE) {
                const batchNumber = (i / BATCHSIZE) + 1
                const batch = finalChanges.slice(i, i + BATCHSIZE)
                const batchIDs = batch.map((audit) => finalChanges.findIndex((change) => change === audit))
                const isLastBatch = (i + BATCHSIZE >= finalChanges.length)

                console.log(`Processing batch number ${batchNumber}:`, batch)
                await submitFormEdits(appID, batch)

                setSaveSubmitProgress((prev) => prev += batchIDs.length)
                console.log(`Successfully submitted batch ${batchNumber}.`)
                totalSubmittedAudits.push(...batchIDs)

                if (!isLastBatch) { // No need to sleep after the very last batch
                    console.log(`Pausing for 500ms before next batch...`)
                    await sleep(500) // Wait for 500 milliseconds
                }

                if (isLastBatch) {
                    console.log("All edit transaction(s) have been submitted successfully.", totalSubmittedAudits)
                    setIsSuccessful(true)
                }
            }

            console.log(`${totalSubmittedAudits.length} audit(s) submitted.`)
            setIsSaving(false) // end saving after audit submission attempt
            return totalSubmittedAudits
        } catch (error) { onSubmitError(error, 'submit transaction(s)') }
    }

    const onSubmitError = (error: any, action: string) => {
        var errorMessage: string
        if (axios.isAxiosError(error)) {
            setSubmissionMessage(`Unable to ${action}: ${error.code} (${error.status})`)

            if (error.response) errorMessage = `An API error occured to ${action}. See error: ${error.message}. ${error.response.data?.message}`
            else errorMessage = `An unexpected API error occured to ${action}. No response received.`
        } else {
            setSubmissionMessage(`Unable to ${action}: System error occured.`)
            errorMessage = `System error occured to ${action}. See error: ${error}`
        }
        
        setIsSaving(false)
        setIsSuccessful(false)
        console.log(errorMessage)
        emailErrorReport(currentUser.fullName, 'Edited forms submission attempt', errorMessage)
    }

    const cancelSave = () => {
        setSubmissionMessage("")
        setSubmitActionMessage("")
        setIsSuccessful(undefined)
        setIsSaving(false)
        setSaveSubmitProgress(0)
    }

    // Start entire edit forms process over
    const reset = () => {
        setForm([])
        setRecordNumber('')
        setForms([])
        setRenderError(false)
        setRecordDate('')
        setRI('')
        setOriginalFormData(null)
        setAuditTracking([])
        setFormChanges([])
        cancelSave()
    }

    const exit = () => {
        console.log(`Exiting Edit Forms...`)
        setEditMode(undefined)
        cancelSave()
        reset()
        window.location.reload() // refresh the page
    }

    // loading state
    if (!dataLoaded) return <Flex justifyContent='center' alignContent='center'><Loading id="content-loading" /></Flex>
    
    return (
        <EditFormsContext.Provider 
        value={{
            qr: currentUser.qrID,
            appID,
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
            renderError,
            setRenderError,
            formErrors,
            originalFormData,
            form,
            forms,
            setFormData,
            formChanges,
            updateFormChange,
            updateBulkFormChange,
            selectBulkEdit,
            setSelectBulkEdit,
            reset,
            clearAllEdits,
            isSaving,
            saveSubmitProgress,
            isSuccessful,
            setIsSuccessful,
            saveForms,
            deleteFormIDs,
            submitTransactions,
            submitActionMessage,
            submissionMessage,
            cancelSave,
            exit
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