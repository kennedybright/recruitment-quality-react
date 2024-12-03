import React, { createContext, useContext, useState, useEffect } from 'react'
import { format, toZonedTime } from 'date-fns-tz'
import { FieldValues, FormProvider, useForm, UseFormReturn } from 'react-hook-form'
import { useMAFContext } from '../../../maf-api'
import { ErrorFillIcon, SupportFillIcon } from '@nielsen-media/maf-fc-icons'

// Handle keyboard typing events!

// ------------------------------------------------------------------------------- //
// All Form Interfaces and helper functions to track multiple forms in one session
export interface FormField {
  id: number
  label: string
  fieldType: string
  value: any // Default value of the field
  isValid?: boolean // for form validation
  isRequired: boolean
}

/*Fetch default Form Fields using API
const fetchFields = async(): Promise<FormField[]> => {
  try {
    import('./maf-api/api-form-data').then(api => {
      const form = await api.fetchFormFields(1001)
    })
    return form.fields
  } catch(err) {
    console.error("Error fetching form fields: ", err)
    return []
  }
}*/

const audioFields: FormField[] = [
  {id: 1, label: 'qr-id', value: '', fieldType: 'Autopopulated', isValid: true, isRequired: true},
  {id: 2, label: 'ri-id', value: '', fieldType: 'Dropdown', isValid: true, isRequired: true},
  {id: 3, label: 'sample-id', value: '', fieldType: 'Text', isValid: true, isRequired: true},
  {id: 4, label: 'record-date', value: null, fieldType: 'Autopopulated', isValid: true, isRequired: true},
  {id: 5, label: 'record-time', value: null, fieldType: 'Autopopulated', isValid: true, isRequired: true},
  {id: 6, label: 'ri-shift-id', value: '', fieldType: 'Autopopulated', isValid: true, isRequired: true},
  {id: 7, label: 'site-name-id', value: '', fieldType: 'Autopopulated', isValid: true, isRequired: true},
  {id: 8, label: 'call-type-id', value: '', fieldType: 'Dropdown', isValid: true, isRequired: true},
  {id: 9, label: 'frame-code-id', value: '', fieldType: 'Dropdown', isValid: true, isRequired: true},
  {id: 10, label: 'call-direction', value: '', fieldType: 'Dropdown', isValid: true, isRequired: true},
  {id: 11, label: 'department', value: 'QR', fieldType: 'STRING', isValid: true, isRequired: true},
  {id: 12, label: 'audit-tracking', value: 'false', fieldType: 'BOOLEAN', isValid: true, isRequired: true},
  {id: 13, label: 'introduction', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 14, label: 'question-order', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 15, label: 'foot-in-the-door', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 16, label: 'eligibility', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 17, label: 'reminders', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 18, label: 'incentive', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 19, label: 'hh-size', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 20, label: 'home-address', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 21, label: 'cooperation', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 22, label: 'media', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 23, label: 'media-probes', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 24, label: 'age-gender-enumeration', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 25, label: 'race', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 26, label: 'ethnicity', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 27, label: 'language-probes', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 28, label: 'employment', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 29, label: 'education', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 30, label: 'grid', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 31, label: 'internet', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 32, label: 'num-of-tvs', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 33, label: 'income', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 34, label: 'commitment', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 35, label: 'name-collection', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 36, label: 'explanation', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 37, label: 'legal-statements', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 38, label: 'email', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 39, label: 'primary-residence', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 40, label: 'tv-programming', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 41, label: 'streaming-vmvpd', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 42, label: 'privacy', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 43, label: 'install-scheduling', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 44, label: 'product', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 45, label: 'closing', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 46, label: 'comments', value: '', fieldType: 'Text', isValid: true, isRequired: false},
  {id: 47, label: 'other', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 48, label: 'coding-time', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 49, label: 'overcoming-objections', value: null, fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 50, label: 'disposition', value: '', fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 51, label: 'mca-category', value: '', fieldType: 'Dropdown', isValid: true, isRequired: false},
  {id: 52, label: 'mca-category-comments', value: '', fieldType: 'Text', isValid: true, isRequired: false},
  {id: 53, label: 'mca-summary-observation', value: '', fieldType: 'Text', isValid: true, isRequired: false},
  {id: 54, label: 'improper-intro', value: 'false', fieldType: 'Checkbox', isValid: true, isRequired: false},
  {id: 55, label: 'inaccurate-data', value: 'false', fieldType: 'Checkbox', isValid: true, isRequired: false},
  {id: 56, label: 'leading-bias', value: 'false', fieldType: 'Checkbox', isValid: true, isRequired: false},
  {id: 57, label: 'verbatim-break', value: 'false', fieldType: 'Checkbox', isValid: true, isRequired: false},
  {id: 58, label: 'mandatory-text', value: 'false', fieldType: 'Checkbox', isValid: true, isRequired: false},
  {id: 60, label: 'do-not-print', value: 'false', fieldType: 'Checkbox', isValid: true, isRequired: false},
  {id: 61, label: 'excellent-call', value: 'false', fieldType: 'Checkbox', isValid: true, isRequired: false},
  {id: 62, label: 'caution', value: 'false', fieldType: 'Checkbox', isValid: true, isRequired: false},
  {id: 63, label: 'live-call', value: 'false', fieldType: 'Checkbox', isValid: true, isRequired: false},
  {id: 64, label: "audio-smp", value: "Audio", fieldType: "Toggle", isValid: true, isRequired: true}
]

const DEFAULT_FIELDS: FormField[] = audioFields.map((field) => {
  // replace "false" field string values with false boolean value 
  if (field.value === 'false') { 
    return {...field, value: false}
  } else {
    return field
  }
}, []) // fetchFields()

// Current Form Details
export interface FormMetadata {
  recordDate: string
  recordTime: string 
  qrID: string
  siteName: string
}

/*Fetch default QR ID & Site Name when the form is initialized or loaded using API
const fetchUser = async(): Promise<Partial<FormMetadata>> => {
  try {
    import('./maf-api/api-form-data').then(api => {
      const username = await api.fetchUsername()
      const { qrID, siteName } = await api.fetchQRID(username)
    }) 
    return { qrID, siteName }
  } catch(err) {
    console.error("Error fetching current user's metadata: ", err)
    return { qrID: '', siteName: '' }
  }
}*/

const defaultUser = {
  qrID: "GQA17",
  siteName: "DALLAS"
}

const DEFAULT_USER = defaultUser // fetchUser()

export interface FormState {
  isActive: boolean // if form is currently being completed
  hasErrors: boolean
}

export interface Form {
  formID: number
  metadata: FormMetadata
  fields: FormField[]
  state: FormState
}

export interface QAForms {
  forms: Form[]
  activeFormID: number | null
}

// ------------------------------------------------------------------------------- //
// Helper Functions

function formatDateTime(date: Date) {
  const estDate = toZonedTime(date, 'America/New_York')
  const formattedDate = format(estDate, 'MM/dd/yyyy')
  const formattedTime = format(estDate, 'hh:mm aa')
  return { formattedDate, formattedTime }
}

// Saves the current QAForms data to sessionStorage
function saveForms(formData: QAForms) {
  sessionStorage.setItem('formData', JSON.stringify(formData))
}

// Retrieves the current QAForms data from sessionStorage
function loadForms(): QAForms {
  const now = new Date()
  const metadata = {
    recordDate: formatDateTime(now).formattedDate, 
    recordTime: formatDateTime(now).formattedTime,
    ...DEFAULT_USER
  }

  const firstForm: Form = {
    formID: 1,
    metadata: metadata,
    fields: DEFAULT_FIELDS,
    state: { isActive: true, hasErrors: false }
  }

  const data = sessionStorage.getItem('formData')
  return data ? JSON.parse(data) : { forms: [firstForm], activeFormID: 1 }
}

// ------------------------------------------------------------------------------- //
// Form context properties

interface FormContextProps {
  methods: UseFormReturn<FieldValues, any>
  qaForms: QAForms
  setActiveForm: (formID: number) => void
  getActiveForm: () => Form
  createNewForm: () => void
  deleteCurrentForm: () => void
  updateField: (name: string, value?: any, required?: boolean, valid?: boolean) => void
  resetQA: () => void
  getFields: (startID: number, endID: number) => FormField[] 
  onSubmit: () => void 
}

// Create the context to track the active form
const FormContext = createContext<FormContextProps | undefined>(null)

// ------------------------------------------------------------------------------- //
// Main Form Context Provider for each section of the form (Form Details & Form Body)

export const QAFormProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const {
    actions: { navigate },
    selectors: { useAppPath, useUserData, useNavigate },
    notifier: { dialog }
  } = useMAFContext()
  const [ appId, screenId ] = useAppPath()

  // register default values in form
  const defaultValues = DEFAULT_FIELDS.reduce((acc, field) => {
    acc[field.label] = field.value
    return acc
  }, {})
  const methods = useForm({defaultValues})
  
  const intitalFormData: QAForms = loadForms()
  const [qaForms, setQaForms] = useState<QAForms>(intitalFormData)

  // Updates the sessionStorage on form change
  useEffect(() => {
    saveForms(qaForms)
  }, [qaForms])

  // Set state for a specific form
  const setFormState = (formID: number, state: Partial<FormState>) => {
    setQaForms((prevForms) => {
      const updatedForms = prevForms.forms.map((form) => 
        form.formID === formID ? {...form, state: { ...form.state, ...state }} : form
      )
      return { ...prevForms, forms: updatedForms }
    })
  }

  // Set field state of the active form
  const setFieldState = (fieldName: string, state: boolean) => {
    setQaForms((prevForms) => {
      const updatedForms = prevForms.forms.map((form) => {
        if (form.formID === prevForms.activeFormID) {
          const updatedFields = form.fields.map((field) => 
            field.label === fieldName ? {...field, isValid: state} : field
          )
          return { ...form, fields: updatedFields }
        }
        return form
      })
      return { ...prevForms, forms: updatedForms }
    })
  }

  // Set the Active form
  const setActiveForm = (formID: number) => {
    setFormState(formID, {isActive: true})
    setQaForms((prevForms) => {
      return { ...prevForms, activeFormID: formID }
    })
    console.log("New active form set: ", qaForms.activeFormID)
  }

  // Retrieve the Active form
  const getActiveForm = () => {
    return qaForms.forms.find(form => form.formID === qaForms.activeFormID)
  }

  // Setter method for updating form field values
  const updateField = (name:string, value?: any, required?: boolean, valid?: boolean) => {
    setQaForms((prevForms) => {
      const updatedForms = prevForms.forms.map((form) => {
        if (form.formID === prevForms.activeFormID) {
          const updatedFields = form.fields.map((field) => 
            field.label === name ? {...field, value: value, isRequired: required, isValid: valid} : field
          )
          return { ...form, fields: updatedFields }
        }
        return form
      })
      return { ...prevForms, forms: updatedForms }
    })
  }

  // Create new form and set it to Active and the previous form to Inactive
  const createNewForm = () => {
    const now = new Date()
    const newMetadata = {
      recordDate: formatDateTime(now).formattedDate, 
      recordTime: formatDateTime(now).formattedTime,
      ...DEFAULT_USER
    }
    
    const newState = { isActive: true, hasErrors: false }
    
    const newForm: Form = {
      formID: qaForms.forms.length + 1,
      metadata: newMetadata,
      fields: DEFAULT_FIELDS,
      state: newState
    }
    
    setQaForms((prevForms) => {
      return { forms: [...prevForms.forms, newForm], activeFormID: newForm.formID }
    })

    navigate({ appState: { activeFormID: newForm.formID } })
    console.log("New form created: ", newForm)
    console.log("Updated forms: ", qaForms)
    console.log("Updated active form: ", getActiveForm())
  }

  // Deleting current form and setting the previous form to Active
  const deleteCurrentForm = () => {
    setQaForms(prev => {
      console.log("All forms: ", qaForms)

      const { forms, activeFormID } = prev
      const formActiveNdx = forms.findIndex(form => form.formID === activeFormID) // index of currently active form

      const updatedForms = forms.filter(form => form.formID != activeFormID) // delete active form

      let prevActiveFormID = null
      if (formActiveNdx > 0) {
        // set Active to the previous form if exists
        prevActiveFormID = updatedForms[formActiveNdx - 1].formID
      } else if (updatedForms.length > 0) {
        // set Active to the first form
        prevActiveFormID = updatedForms[0].formID
      }
      setActiveForm(prevActiveFormID)
      navigate({ appState: { activeFormID: prevActiveFormID } })
      return { forms: updatedForms, activeFormID: prevActiveFormID }
    })

    console.log("Current form deleted. Updated forms: ", qaForms)
  }

  // Clear forms data in context and sessionStorage
  const resetQA = () => {
    setQaForms({ forms: [], activeFormID: null })
    sessionStorage.removeItem('formData')
  }

  // Retrieve a list of fields by range
  const getFields = (startID: number, endID: number) => {
    return getActiveForm().fields.filter((field) => field.id >= startID && field.id <= endID )
  }

  // Global submit event
  const onSubmit = () => {
    const confirm = () => {
      console.log('Form submitted with data: ', qaForms.forms)
      console.log("Exiting Audio/SMP QA monitoring form...")
      //navigate({ appId: appId }) // navigate to homepage
    }

    dialog.show('Forms successfully submitted.', {
      icon: SupportFillIcon,
      variant: dialog.variant.success,
      buttons: {
        confirm: {
          onClick: () => confirm(),
          text: 'Exit',
        }
      }
    })
    resetQA()
  }
  
  return (
    <FormContext.Provider value={{
      methods,
      qaForms,
      setActiveForm,
      getActiveForm,
      updateField,
      createNewForm,
      deleteCurrentForm,
      resetQA,
      getFields,
      onSubmit
      }}
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <FormProvider {...methods}>
          {children}
        </FormProvider>
      </form>
    </FormContext.Provider>
  )
}

// Custom hook to use the form context
export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) throw new Error("useQAFormContext must be used within a FormProvider")
  return context
}