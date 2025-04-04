// All Form Interfaces and helper functions to track multiple forms in one session
import { format, toZonedTime } from 'date-fns-tz'
import { fetchFormFields, submitForms, submitFormsTEMP } from '../maf-api/api-form-data'
import { formatDateTime, convertTo24H } from './shared'

export interface FormField {
    id: number
    label: string
    name: string
    fieldType: string
    value: any // Default value of the field
    isValid?: boolean // for form validation
    isRequired: boolean
}

export interface FormMetadata {
    recordDate: string
    recordTime: string
    qrID: string
    siteName: string
}
  
export interface Form {
    formID: number
    metadata: FormMetadata
    fields: FormField[]
}
  
export interface QAForms {
    forms: Form[]
    activeFormID: number | null
}
  
// Initial form load for initial form rendering 
export function loadForms(appID:number, user:{qrID:string, siteName:string}, fields:FormField[]) {
    const { formattedDate, formattedTime } = formatDateTime(new Date())
    const metadata: FormMetadata = {
      recordDate: formattedDate, 
      recordTime: formattedTime,
      ...user
    }
  
    const firstForm: Form = {
      formID: 1,
      metadata: metadata,
      fields: fields
    }
  
    const data = localStorage.getItem(`formData-${appID}`)
    return data ? JSON.parse(localStorage.getItem(`formData-${appID}`)) : { forms: [firstForm], activeFormID: 1 }
}
  
// Saves the current QAForms data to localStorage
export function saveForms(appID:number, formData:QAForms) { localStorage.setItem(`formData-${appID}`, JSON.stringify(formData)) }

// Clear forms data in localStorage
export function resetQA(appID: number) { localStorage.removeItem(`formData-${appID}`) }
  
// Restructures the forms into array object format for API form submission  
export function buildFormsSubmitBody(appID:number, forms:Form[]):any[] {
    return forms.flatMap((form) => {
      const { metadata, fields } = form
      const cstDate = toZonedTime(new Date(), 'America/Chicago') // convert timestamp to CST timezone

      const updatedForm = {
        record_date: metadata.recordDate,
        record_time: convertTo24H(metadata.recordTime),
        qr_id: metadata.qrID,
        app_id: appID,
        created_by: metadata.qrID,
        created_date: format(cstDate, 'yyyy-MM-dd HH:mm:ss')
      }
  
      // filter out metadata fields from fields list
      const filteredFields = fields.filter((field) => !["qr_id", "record_date", "record_time"].includes(field.label))
      filteredFields.forEach((field) => { updatedForm[field.label] = field.value })
      return updatedForm
    })
}

export function validateForms(appID:number, forms:Form[]):any[] {
    // check required fields
    const formsMissingReqs = validateMissingReqs(
      forms, 
      ["audio_smp", "ri_id", "ri_shift", "sample_id", "site_name_id", "call_type_id", "frame_code_id", "call_direction"]
    )

    // form-specific errors based on application type (eg. Audio/SMP vs. TAM)
    let formErrors = [] 
    if (appID === 1001) { formErrors = validateAudioSMP(forms) }
    
    // build combined errors list
    const merge = [...formsMissingReqs, ...formErrors]
    if (merge.length === 0) {
        console.log("No errors were found in the forms.")
        return []
    } else {
        const combinedErrors = {}
        merge.forEach((item) => {
            if (!combinedErrors[item.formID]) { combinedErrors[item.formID] = { ...item } 
            } else { combinedErrors[item.formID] = { ...combinedErrors[item.formID], ...item } }
        })
        const errors = Object.values(combinedErrors)
        console.warn("Errors found: ", errors)
        return errors
    }
}

// Validate forms using Audio/SMP-specific data error logic
function validateMissingReqs(forms:Form[], reqFields:string[]) {
  // check required fields
  const formsMissingReqFields = forms.map((form) => {
    const missingFields = form.fields.filter((field) => reqFields.includes(field.label)).filter((field) => field.value === undefined || field.value === null || field.value === "")?.map((field) => field.label)
    if (missingFields.length > 0) {
      return { formID: form.formID, fixReqFields: missingFields }
    }
  }).filter(Boolean)
  return formsMissingReqFields
}

// Validate forms using Audio/SMP-specific data error logic
function validateAudioSMP(forms:Form[]) {
  // check incorrect Form type & Call type combinations
  const incorrectTypeForms = forms.filter((form) => 
    form.fields.find((field) => field.label === "audio_smp").value === "SMP" 
    && (form.fields.find((field) => field.label === "call_type_id").value === "FL" || form.fields.find((field) => field.label === "call_type_id").value === "SP")
  )?.map((form) => (
      {formID: form.formID, 
      formType: form.fields.find((field) => field.label === "audio_smp").value, 
      callType: form.fields.find((field) => field.label === "call_type_id").value}
  ))
  return incorrectTypeForms
}
  
// Submit all forms using API
export async function submitAllForms(appID:number, forms:Form[]):Promise<any[]> {
    if (forms.length === 0) {
      console.log('No forms to submit.')
      return
    }

    const formsToSubmit = buildFormsSubmitBody(appID, forms)
    console.log("Forms to be submitted: ", formsToSubmit)
  
    try {
      let responses = []
      let batchSize = 5 //25
      const batchSubmitForms = async(formsToSubmit, batchSize) => {
        for (let i = 0; i < forms.length; i += batchSize) {
          const batch = formsToSubmit.slice(i, i + batchSize)
          console.log(`Submitting batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(forms.length/batchSize)}`)
          const batchRes = await submitFormsTEMP(batch) // submitForms(batch)
          console.log(`Batch ${Math.floor(i/batchSize) + 1} complete.`)
          responses.push(batchRes)
        }
      }

      if (formsToSubmit.length > batchSize) { 
        await batchSubmitForms(formsToSubmit, batchSize)
        console.log("All forms have been successfully submitted: ", responses)
      } else {
        const response = await submitFormsTEMP(formsToSubmit) // submitForms(formsToSubmit)
        responses.push(response)
        console.log("All forms have been successfully submitted: ", response)
      }
      return responses
    } catch(err) {
      throw new Error("Error submitting forms: ", err)
    }
}

// Returns a filtered list of fields using a number range (field ID)
export function getFieldsbyRange(fields:FormField[], min:number, max:number):FormField[] {
  return fields?.filter(field => field.id >= min && field.id <= max)
}