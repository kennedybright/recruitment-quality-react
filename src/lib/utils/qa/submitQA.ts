// All Form Interfaces and helper functions to track multiple forms in one session
import { Form } from '../../types/forms.types'
import { convertTo24H, formatTimestamp } from '../formatDateTime'

// Restructures the form into array object format for API form submission  
export function buildFormSubmission(appID:number, form:Form):any {
    const { formRef, metadata } = form

    const updatedForm = {
        ...formRef, // append form field values
        record_date: metadata.recordDate,
        record_time: convertTo24H(metadata.recordTime),
        qr_id: metadata.qrID,
        app_id: appID,
        created_by: metadata.qrID,
        created_date: formatTimestamp(new Date(), 'America/Chicago') // convert timestamp to CST timezone
    }
    
    return updatedForm
}
  
// Restructures the forms into array object format for API form submission  
export function buildFormsSubmission(appID:number, forms:Form[]):any[] {
    return forms.flatMap((form) => {
        const { formRef, metadata } = form

        const updatedForm = {
            ...formRef, // append form field values
            record_date: metadata.recordDate,
            record_time: convertTo24H(metadata.recordTime),
            qr_id: metadata.qrID,
            app_id: appID,
            created_by: metadata.qrID,
            created_date: formatTimestamp(new Date(), 'America/Chicago') // convert timestamp to CST timezone
        }
        
        return updatedForm
    }).sort((a, b) => a.form_id - b.form_id)
}

// // Restructures the AI forms into array object format for API form submission  
// export function buildAIFormsSubmission(appID:number, forms:Form[]):any[] {
//     return forms.flatMap((form) => {
//         const { formRef, metadata } = form

//         const updatedForm = {
//             ...formRef, // append form field values
//             record_date: metadata.recordDate,
//             record_time: convertTo24H(metadata.recordTime),
//             qr_id: metadata.qrID,
//             app_id: appID,
//             created_by: metadata.qrID,
//             created_date: formatTimestamp(new Date(), 'America/Chicago') // convert timestamp to CST timezone
//         }
    
//         return updatedForm
//     }).sort((a, b) => a.form_id - b.form_id)
// }