// All Form Interfaces and helper functions to track multiple forms in one session

import { isDev } from "../../../lib/env"
import { Form, FormField, FormMetadata, FormRef, QAForms, QAFormsAI } from "../../types/forms.types"
import { formatDateTime } from "../formatDateTime"

// Format incoming fetched fields into the correct data types
export function formatFields(fields:FormField[]):FormField[] {
	if (!fields.length) return []

	const sortedFields = fields.sort((a, b) => a.id - b.id)
	const updatedFields = sortedFields.map((field) => {
		// Handle null values
		if (field.value === null) return field

		// Handle booleans
		if (field.value === 'false')  return { ...field, value: false }
		if (field.value === 'true')  return { ...field, value: true }

		// Handle numbers
		const num = Number(field.value)
		if (field.value !== '' && !isNaN(num)) return { ...field, value: num }
		
		// Default: return as-is string
		return field
	})
  
  	return updatedFields
}

// Transform FormField array into a Form Ref object
export function fieldsToRef(fields:FormField[]):Record<string, any> {
	return fields.reduce<Record<string, any>>((acc, field) => {
		acc[field.label] = field.value
		return acc
	}, {})
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
      fields: fields,
      formRef: { form_id: 1, ...fieldsToRef(fields) }
    }
  
	localStorage.removeItem(`formData-${appID}`)
	const storageName = isDev ? `ccqaDEV-${appID}` : `ccqa-${appID}`
    const data = localStorage.getItem(storageName)
    return data ? JSON.parse(localStorage.getItem(storageName)) : { forms: [firstForm], activeFormID: 1 }
}
  
// Saves the current QAForms data to localStorage
export function saveForms(appID:number, formData:QAForms) {
	const storageName = isDev ? `ccqaDEV-${appID}` : `ccqa-${appID}` 
	localStorage.setItem(storageName, JSON.stringify(formData)) 
}

// Clear forms data in localStorage
export function resetQA(appID: number) { 
	const storageName = isDev ? `ccqaDEV-${appID}` : `ccqa-${appID}` 
	localStorage.removeItem(storageName) 
}

// Initial AI form load for initial form rendering 
export function loadAIForms(appID:number) {
	const storageName = isDev ? `ccqaAIDEV-${appID}` : `ccqaAI-${appID}`
    const data = localStorage.getItem(storageName)
    return data ? JSON.parse(localStorage.getItem(storageName)) : { forms: [], activeFormID: undefined, queryCache: [], formChanges: [] }
}
  
// Saves the current AI QAForms data to localStorage
export function saveAIForms(appID:number, formData:QAFormsAI) {
	const storageName = isDev ? `ccqaAIDEV-${appID}` : `ccqaAI-${appID}` 
	localStorage.setItem(storageName, JSON.stringify(formData)) 
}

// Clear forms data in localStorage
export function resetAIQA(appID: number) { 
	const storageName = isDev ? `ccqaAIDEV-${appID}` : `ccqaAI-${appID}` 
	localStorage.removeItem(storageName) 
}
  
// Returns a filtered list of fields using form field type (field type)
export function getFieldsbyType(fields:FormField[], fieldType:string|string[]):FormField[] {
  return fields?.filter(field => field.fieldType === fieldType || fieldType.includes(field.fieldType))
}