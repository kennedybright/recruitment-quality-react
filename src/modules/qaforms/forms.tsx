import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react'
import { FormField, Form, QAForms, loadForms, saveForms, submitAllForms, validateForms, resetQA } from '../../lib/utils/qa-forms'
import { formatDateTime, isEmpty } from '../../lib/utils/shared'
import { emailErrorReport } from '../../lib/maf-api/api-form-data'
import { FieldValues, FormProvider, useForm, UseFormReturn } from 'react-hook-form'
import { useMAFContext } from '../../maf-api'
import { CheckmarkIcon, ErrorOutlineIcon, WarningFillIcon } from '@nielsen-media/maf-fc-icons'
import Flex from '@nielsen-media/maf-fc-flex'
import { useDataContext } from '../../lib/context/static-data'
import { Loading } from '../../lib/global/components'
import Modal from '@nielsen-media/maf-fc-modal'
import Dialog from '@nielsen-media/maf-fc-dialog'
import { confirmLeaveScreen } from '@nielsen-media/maf-frontend-layer'
import { NotifierDialogProps } from '@nielsen-media/maf-frontend-layer/build/infra-v2/types/src/app/ui/components/notifier-dialog'

interface FormContextProps {
  methods: UseFormReturn<FieldValues, any>
  qaForms: QAForms
  activeForm: Form
  activeFields: FormField[]
  setActiveForm: (formID: number) => void
  updateActiveForm: (form: Form) => void
  createNewForm: () => void
  deleteCurrentForm: () => void
  updateField: (name: string, value?: any) => void
  setDefaultField: (name: string, value?: any) => void
  getFields: (startID: number, endID: number) => FormField[] 
  onSubmit: () => Promise<void> 
  isSuccessful: boolean
  submissionMessage: string
}

interface FormProviderProps {
  children: ReactNode
  userData: {qrID:string, siteName:string}
  appID: number
  formFields: FormField[]
}

// Create the context to manage QA monitoring activities
const FormContext = createContext<FormContextProps>(null)

// ------------------------------------------------------------------------------- //

// Main Form Context Provider for each section of the form (Form Details & Form Body)
export const QAFormProvider: FC<FormProviderProps> = ({ children, userData, appID, formFields }) => {
  const {
    actions: { navigate },
    notifier: { dialog }
  } = useMAFContext()

  const [dataLoaded, setDataLoaded] = useState(false)
  const { dropdowns, skipLogicList } = useDataContext() // Get all dropdown and skiplogic lists
  useEffect(() => { // check if all static data has been loaded
    const allDropdownsHaveData = Object.values(dropdowns).every((list) => !isEmpty(list)) 
    if (allDropdownsHaveData && skipLogicList.length > 0) setDataLoaded(true)
  }, [dropdowns, skipLogicList])

  // convert null default field values to undefined
  const fields: FormField[] = formFields.map((field) => ({ ...field, value: field.value === null ? undefined : field.value}))
  
  // Loads the QAForms data once fields and user data are fetched
  const initialFormData: QAForms = loadForms(appID, userData, fields)
  const [qaForms, setQaForms] = useState<QAForms>(initialFormData)

  // register default field values in form
  const [defaultFields, setDefaultFields] = useState<FormField[]>(fields)
  const defaultValues = fields.reduce((acc, field) => {
    acc[field.label] = field.value
    return acc
  }, {})
  const methods = useForm<FieldValues>(defaultValues)

  // immediately navigate to the active form
  useEffect(() => { 
    const activeForm = getActiveForm()
    if (activeForm) navigate({ appState: { activeFormID: activeForm.formID } })
  }, [])

  // Updates the sessionStorage on form change
  useEffect(() => { saveForms(appID, qaForms) }, [qaForms])

  // Setter method for Active Form & navigate to new active form
  const setActiveForm = (formID: number) => {
    setQaForms((prev) => ({ ...prev, activeFormID: formID }))
    navigate({ appState: { activeFormID: formID } })
  }

  // Setter method for updating Active Form
  const updateActiveForm = (activeForm: Form) => { 
    setQaForms(prev => ({
      ...prev, 
      forms: prev.forms.map(form => {
        if (form.formID === activeForm.formID) return activeForm
        return form
      })
    }))
  }

  // Getter method for Active Form
  const getActiveForm = (): Form => { return qaForms.forms?.find((form) => form.formID === qaForms.activeFormID) }

  // Setter method for updating form field values
  const updateField = (name:string, value?:string | number | null | boolean) => {
    const updatedForms = qaForms.forms.map((form) => {
      if (form.formID === qaForms.activeFormID) {
        const updatedFields = form.fields.map((field) => {
          if (name === "ri_id" && field.label === "site_name_id") { // auto-update RI's site name
            return { ...field, value: dropdowns.ri_id.find(ri => ri.label === value.toString())?.siteNameID}
          }
          if (field.label === name) {
            // replace empty strings or undefined values with null
            const isEmptyUndefined = (typeof value === "string" && value === "") || value === undefined
            return {...field, value: isEmptyUndefined ? null : value}
          }
          return field
        })
        return { ...form, fields: updatedFields }
      }
      return form
    })
    setQaForms(prev => ({ ...prev, forms: updatedForms }))
  }

  // Setter method for updating default form field values
  const setDefaultField = (name:string, value?:string | number | null) => {
    const updatedFields = defaultFields.map((field) => {
      if (name === "ri_id" && field.label === "site_name_id") { // auto-update RI's site name
        return { ...field, value: dropdowns.ri_id.find(ri => ri.label === value.toString())?.siteNameID}
      }
      if (field.label === name) return {...field, value: value}
      return field
    })
    setDefaultFields(updatedFields)
  }

  // Create new form and set it to Active and the previous form to Inactive
  const createNewForm = () => {
    let newFormID: number
    if (!qaForms.forms || qaForms.forms.length === 0) {
      newFormID = 1
    } else {
      const maxFormID = Math.max(...qaForms.forms.map(form => form.formID))
      newFormID = maxFormID + 1
    }
    const { formattedDate, formattedTime } = formatDateTime(new Date())
    const newForm: Form = {
      formID: newFormID,
      metadata: {
        recordDate: formattedDate, 
        recordTime: formattedTime,
        ...userData
      },
      fields: defaultFields
    }
    setQaForms({ ...qaForms, forms: [...qaForms.forms, newForm], activeFormID: newFormID })
    navigate({ appState: { activeFormID: newFormID } })
  }

  // Deleting current form and setting the previous form to Active
  const deleteCurrentForm = () => {
    const deleteForm = () => {
      const { forms, activeFormID } = qaForms
      const formActiveNdx = forms.findIndex(form => form.formID === activeFormID) // index of currently active form
      const updatedForms = forms.filter(form => form.formID != activeFormID) // delete active form

      let newActiveForm: Form
      if (formActiveNdx > 0) {
        newActiveForm = updatedForms[formActiveNdx - 1] // set Active to the previous form if exists
      } else {
        newActiveForm = updatedForms[0] // set Active to the first form
      }
      setQaForms({ forms: updatedForms, activeFormID: newActiveForm.formID })
      navigate({ appState: { activeFormID: newActiveForm.formID } })
    }

    dialog.show('Are you sure you want to delete?', {
      icon: WarningFillIcon,
      variant: dialog.variant.danger,
      message: 'Are you sure you want to delete the current form? This process cannot be undone.',
      buttons: {
          confirm: {
              onClick: () => deleteForm(),
              text: 'Delete'
          }
      }
    })
  }

  // Retrieve a list of fields by range
  const getFields = (startID: number, endID: number): FormField[] => {
    const activeForm = getActiveForm()
    return activeForm?.fields.filter((field) => field.id >= startID && field.id <= endID )
  }

  // Global submit event
  const [isSuccessful, setIsSuccessful] = useState<boolean>(true)
  const [submissionMessage, setSubmissionMessage] = useState<string>(null)
  const onSubmit = async () => {
    const errors = await validateForms(appID, qaForms.forms) // check forms for errors
    if (errors.length > 0) {
      setIsSuccessful(false)
      setSubmissionMessage(`Errors found in forms. Please ensure that all forms are completed correctly before submitting.`)
    } else {
      const responses = await submitAllForms(appID, qaForms.forms)
      if (responses) {
        const resErrors = responses.map((response, index) => {
          if (response.status > 300) return `Submission batch ${index+1}: FAILED - ${response.status} ${response.statusText} // ${response.data?.error}\n`
        }).filter(Boolean)
        console.log(resErrors)
        if (resErrors.length > 0) {
          setIsSuccessful(false)
          setSubmissionMessage(`System error occured while submitting the forms. See API errors: ${errors}`)
        }
      }
    }
  }

  // loading state
  if (!dataLoaded) return <Flex justifyContent='center' alignContent='center'><Loading className="qa-form-loading" /></Flex>
  
  return (
    <FormContext.Provider value={{
      methods,
      qaForms,
      activeForm: getActiveForm(),
      activeFields: getActiveForm().fields,
      setActiveForm,
      updateActiveForm,
      updateField,
      setDefaultField,
      createNewForm,
      deleteCurrentForm,
      getFields,
      onSubmit,
      isSuccessful,
      submissionMessage
      }}
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <FormProvider {...methods}>
            {dataLoaded && children}
        </FormProvider>
      </form>
    </FormContext.Provider>
  )
}

// Custom hook to use the form context
export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) throw new Error("useFormContext must be used within a FormProvider")
  return context
}