// All Form Interfaces and helper functions to track multiple forms in one session

import { FormRef, FormError, FormField } from "../../types/forms.types"

export function validateForms(appID:number, defaultFields:FormField[], forms:FormRef[], aiEnabled:boolean=false): FormError[] {
    // check required fields
    const reqFields = defaultFields.filter(field => field.isRequired).map(field => field.label)
    const formsMissingReqs = validateMissingReqs(reqFields, forms, aiEnabled)

    // check for non-numeric Call IDs
    const formsIncorrectCallIDs = validateIncorrectCallIDs(appID, forms, aiEnabled)

    // form-specific errors based on application type (eg. Audio/SMP, TAM)
    let appFormErrors = appID === 1001 ? validateAudioSMP(forms, aiEnabled) : []

    // combine all errors
    const allErrors = [...formsMissingReqs, ...formsIncorrectCallIDs, ...appFormErrors].sort(((a, b) => a.formID - b.formID))
    return allErrors
}

// Validate forms with missing required field values
function validateMissingReqs(reqFields: string[], forms:FormRef[], aiEnabled?:boolean): FormError[] {
    let errors = []
    forms.forEach((form) => {
        const missingReqFields = Object.entries(form).map(([key, value]) => {
            if (reqFields.includes(key) && (value === null || value === "")) return key.replaceAll("_", " ").toUpperCase()
        })?.filter(Boolean)
        if (missingReqFields.length > 0)
            errors.push({ 
                formID: aiEnabled ? form.ai_record_number : (form.form_id ?? form.record_number),
                error: "Required field(s) not entered", 
                errorContext: missingReqFields.join(", ")
            })
    })
    return errors
}

// Validate forms with incorrect call ID
export function validateIncorrectCallIDs(appID:number, forms:FormRef[], aiEnabled?:boolean): FormError[] {
    let errors = []
    forms.forEach((form) => {
        const callID = appID === 1001 ? form.sample_id : form.interview_id
        if (callID && !/^[0-9]+$/.test(String(callID))) errors.push({ 
            formID: aiEnabled ? form.ai_record_number : (form.form_id ?? form.record_number),
            error: "Call ID is not numeric only",
            errorContext: String(callID)
        })
    })
    return errors
}

// Validate forms using Audio/SMP-specific data error logic
export function validateAudioSMP(forms:FormRef[], aiEnabled?:boolean): FormError[] {
    let errors = []
    // check incorrect Form type & Call type combinations
    forms.filter((form) => form.audio_smp === "SMP" && ["FL", "SP"].includes(form.call_type_id))?.forEach((form) => {
        errors.push({
            formID: aiEnabled ? form.ai_record_number : (form.form_id ?? form.record_number), 
            error: "Invalid Calltype for SMP", 
            errorContext: form.call_type_id
        })
    })

    forms.filter((form) => form.audio_smp === "SMP" && form.frame_code_id && form.frame_code_id !== "TV")?.forEach((form) => {
        errors.push({
            formID: aiEnabled ? form.ai_record_number : (form.form_id ?? form.record_number), 
            error: "Invalid Framecode for SMP", 
            errorContext: form.frame_code_id
        })
    })

    forms.filter((form) => form.audio_smp === "Audio" && form.frame_code_id && form.frame_code_id === "TV")?.forEach((form) => {
        errors.push({
            formID: aiEnabled ? form.ai_record_number : (form.form_id ?? form.record_number),
            error: "Invalid Framecode for Audio", 
            errorContext: form.frame_code_id
        })
    })

    return errors
}