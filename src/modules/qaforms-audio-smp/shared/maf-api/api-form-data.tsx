import axios from 'axios'
import { FormField, FormMetadata, FormState, QAForms } from '../forms'

const axiosInstance = axios.create({
    baseURL: 'http://[backendURL]:[port]/api'
})

export const fetchUsername = async(): Promise<string> => {
    const response = await axiosInstance.get('/api/current/user')
    return response.data.username // configure response to return Object{} w/ "username" field
}

export const fetchQRID = async(username: string): Promise<{qrID:string, siteName:string}> => {
    const response = await axiosInstance.get('/api/employees/qa/:id', {
        params: { email_address: username }
    })
    return {
        qrID: response.data.qr_id || "",
        siteName: response.data.site_name || ""
    }
}

export const fetchForm = async(recordNumber: number): Promise<{form:[]}> => {
    const response = await axiosInstance.get(`/api/employees/qa/${recordNumber}`)
    return { form: response.data || {} }
}

export const fetchFormFields = async(appID: number): Promise<{fields:FormField[]}> => {
    const response = await axiosInstance.get(`/api/forms/fields`, {
        params: { app_id: appID }
    })
    return { 
        fields: response.data.map(({field}) => ({
            id: field.field_id,
            label: field.field_name.replaceAll("_", "-"),
            fieldType: field.field_type,
            value: field.default_value,
            isValid: true,
            isRequired: !field.optional
        })) || []
    }
}