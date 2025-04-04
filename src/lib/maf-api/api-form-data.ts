// APIs for Form Data

import axios from 'axios'
import { FormField } from '../utils/qa-forms'
import { FieldCatg, FieldLogic } from '../context/static-data';
import { textToTitleCase } from '@nielsen-media/maf-fc-foundation';
import { QAAuditTransaction } from '../../modules/edit-forms/edits/edits';

const axiosInstance = axios.create({ baseURL: 'https://tqa.dev.apps.nielsen.com/api/' })

export const fetchAppData = async(): Promise<FieldCatg[]> => {
    const response = await axiosInstance.get('/usremoterecqa/apps')
    return response.data.map((app) => ({
        label: app.app_name,
        value: app.app_id,
    })) || []
}

export const fetchQRData = async(username: string): Promise<{ qrID: string; siteName: string }> => {
    const response = await axiosInstance.get('/usremoterecqa/employees/qa', {
        params: { email_address: username }
    })
    return {
        qrID: response.data[0]?.qr_id || "",
        siteName: response.data[0]?.site_name_id || ""
    }
}

export const fetchQRManager = async(): Promise<string> => {
    const response = await axiosInstance.get('/usremoterecqa/employees/qa', {
        params: { title: 'Group Leader' }
    })
    return response.data[0]?.email_address || ""
}

export const fetchFormFields = async(appID: number, fieldType?: string): Promise<FormField[]> => {
    const response = await axiosInstance.get('/usremoterecqa/forms/fields', {
        params: { app_id: appID, field_type: fieldType }
    })
    return response.data.map((field) => ({
        id: field.field_id,
        label: field.field_name,
        name: textToTitleCase(field.field_name.replaceAll("_", " ")),
        fieldType: field.field_type,
        value: field.default_value,
        isValid: true,
        isRequired: field.optional ? false : true
    })) || []
}

export const fetchRIData = async(): Promise<FieldCatg[]> => {
    const response = await axiosInstance.get('/usremoterecqa/employees/rec')
    return response.data.map((ri) => ({
        label: ri.ri_id,
        value: ri.ri_id,
        siteNameID: ri.site_name_id 
    })) || []
}

export const fetchAuditTracking = async(): Promise<FieldCatg[]> => {
    const response = await axiosInstance.get('/usremoterecqa/data/audittracking')
    return response.data.map((audit) => ({
        label: audit.audit_track,
        value: audit.audit_track_id,
    })) || []
}

export const fetchCalltypes = async(): Promise<FieldCatg[]> => {
    const response = await axiosInstance.get('/usremoterecqa/data/calltypes', {
        params: { active: true }
    })
    return response.data.map((calltype) => ({
        label: calltype.call_type_id,
        value: calltype.call_type,
    })) || []
}

export const fetchSitenames = async(): Promise<FieldCatg[]> => {
    const response = await axiosInstance.get('/usremoterecqa/data/sitenames', {
        params: { active: true }
    })
    return response.data.map((sitename) => ({
        label: sitename.site_name_id,
        value: sitename.site_name,
    })) || []
}

export const fetchFramecodes = async(): Promise<FieldCatg[]> => {
    const response = await axiosInstance.get('/usremoterecqa/data/framecodes', {
        params: { active: true }
    })
    return response.data.map((framecode) => ({
        label: framecode.frame_code_id,
        value: framecode.frame_code,
    })) || []
}

export const fetchMcaCategories = async(): Promise<FieldCatg[]> => {
    const response = await axiosInstance.get('/usremoterecqa/data/categories')
    return response.data.map((category) => ({
        label: category.mca_category,
        value: category.mca_category,
    })) || []
}

export const fetchCalltypeSkipLogic = async(): Promise<FieldLogic[]> => {
    const response = await axiosInstance.get('/usremoterecqa/forms/fields/audio/calltypes')
    return response.data.map((record) => ({
        field: record.field_name,
        calltype: record.call_type_id,
        disabled: record.disabled,
        audioSMP: record.audio_smp
    })) || []
}

// Creating a new TEMP QA form
export const submitFormsTEMP = async(forms: any[]): Promise<{}> => {
    const response = await axiosInstance.post('/usremoterecqa/forms/temp/audio', forms)
    return response
}

// Creating new QA forms
export const submitForms = async(forms: any[]): Promise<{}> => {
    const response = await axiosInstance.post('/usremoterecqa/forms/audio/historical', forms)
    return response
}

// Updating existing TEMP QA forms
export const updateEditedFormsTEMP = async(forms): Promise<{}> => {
    const response = await axiosInstance.put(`/usremoterecqa/forms/temp/audio`, forms)
    return response
}

// Updating existing QA forms
export const updateEditedForms = async(forms): Promise<{}> => {
    const response = await axiosInstance.put(`/usremoterecqa/forms/audio/historical`, forms)
    return response
}

// Creating new QA form audit transactions
export const submitFormEdits = async(edits: QAAuditTransaction[]): Promise<{}> => {
    const response = await axiosInstance.post('/usremoterecqa/forms/audio/audit', edits)
    return response
}

// Creating new QA form audit transactions
export const submitFormEditsTEMP = async(edits: QAAuditTransaction[]): Promise<{}> => {
    const response = await axiosInstance.post('/usremoterecqa/forms/temp/audio/audit', edits)
    return response
}


export const emailErrorReport = async(systemUser: string, subject: string, error: string): Promise<{}> => {
    const recipients = ['kennedy.bright@nielsen.com']//, 'uscallcenterqualityaudio@nielsen.com']
    const response = await axiosInstance.post('/usremoterecqa/emailErrorReport',
        { 
            emailTo: recipients,
            user: systemUser,
            subj: subject,
            errorMessage: error
        }
    )
    return response.data
}
