// APIs for Form Data

import { Apps, FieldCatg, FieldLogic, FormField, RI } from '../../types/forms.types'
import { QAAuditTransaction } from '../../types/edit.types'
import { apiRoutes } from '../client/apiRoutes'
import axiosInstance from '../client/axiosInstance'

////////////////////////////////////////////////////////////////////////////////////////////////
// GET APIs: 

// Fetch QA applications (lines of business)
export const fetchApps = async(): Promise<Apps> => {
    const { data } = await axiosInstance.get('/apps')
    const apps = {}
    data.forEach((app) => { 
        apps[app.app_id] = { appName: app.app_name, appLOB: app.lob } 
    }) || {}
    return apps
}

// Fetch dropdown list of all RI's
export const fetchAllRI = async(lob?:string): Promise<RI[]> => {
    const { data } = await axiosInstance.get('/employees/rec', {
        params: { lob: lob }
    })
    return data.map((ri) => ({
        id: ri.ri_id,
        lob: ri.lob,
        siteNameID: ri.site_name_id,
        location: ri.location,
        riShift: ri.shift_id,
        audioIVRs: ri.audio_ivr_ids,
        scarIVRs: ri.scarborough_ivr_ids,
        videoIVRs: ri.video_ivr_ids
    })) || []
}

// Fetch QA form fields by line of business (appID) and field type
export const fetchFormFields = async(appID: number, fieldType?: string): Promise<FormField[]> => {
    const { data } = await axiosInstance.get('/forms/fields', {
        params: { app_id: appID, field_type: fieldType }
    })
    return data.map((field) => ({
        id: field.field_id,
        label: field.field_name,
        name: field.field_label,
        fieldType: field.field_type,
        value: field.default_value,
        isValid: true,
        isRequired: field.optional ? false : true
    })) || []
}

// Fetch list of all disable/skip logic for Audio/SMP QA Monitoring
export const fetchCalltypeSkipLogic = async(): Promise<FieldLogic[]> => {
    const { data } = await axiosInstance.get('/forms/fields/audio/calltypes')
    return data.map((record) => ({
        field: record.field_name,
        calltype: record.call_type_id,
        disabled: record.disabled,
        audioSMP: record.audio_smp
    })) || []
}

// Fetch dropdown list of all QA Audit reasoning codes
export const fetchAuditTracking = async(): Promise<FieldCatg[]> => {
    const { data } = await axiosInstance.get('/data/audittracking')
    return data.map((audit) => ({
        label: audit.audit_track,
        value: audit.audit_track_id,
    })) || []
}

// Fetch dropdown list of all call types
export const fetchCalltypes = async(): Promise<FieldCatg[]> => {
    const { data } = await axiosInstance.get('/data/calltypes', {
        params: { active: true }
    })
    return data.map((calltype) => ({
        label: calltype.call_type_id,
        value: calltype.call_type_id,
        name: calltype.call_type
    })) || []
}

// Fetch dropdown list of all site names
export const fetchSitenames = async(): Promise<FieldCatg[]> => {
    const { data } = await axiosInstance.get('/data/sitenames', {
        params: { active: true }
    })
    return data.map((sitename) => ({
        label: sitename.site_name_id,
        value: sitename.site_name_id,
        name: sitename.site_name
    })) || []
}

// Fetch dropdown list of all frame codes
export const fetchFramecodes = async(): Promise<FieldCatg[]> => {
    const { data } = await axiosInstance.get('/data/framecodes', {
        params: { active: true }
    })
    return data.map((framecode) => ({
        label: framecode.frame_code_id,
        value: framecode.frame_code_id,
        name: framecode.frame_code
    })) || []
}

// Fetch dropdown list of all MCA categories
export const fetchMcaCategories = async(): Promise<FieldCatg[]> => {
    const { data } = await axiosInstance.get('/data/categories')
    return data.map((category) => ({
        label: category.mca_category,
        value: category.mca_category,
        priority: category.mca_priority_level
    })) || []
}

////////////////////////////////////////////////////////////////////////////////////////////////
// POST APIs: 

// Creating new QA forms by LOB (appID)
export const submitForms = async(appID: number, forms: any[]): Promise<{}> => {
    const response = await axiosInstance.post(apiRoutes.qa[appID].forms, forms)
    return response
}

// Creating new QA form audit transactions by LOB (appID)
export const submitFormEdits = async(appID: number, edits: QAAuditTransaction[]): Promise<{}> => {
    const response = await axiosInstance.post(apiRoutes.qa[appID].audit, edits)
    return response
}

// Creating new QA AI form audit transactions by LOB (appID)
export const submitAIFormEdits = async(appID: number, edits: QAAuditTransaction[]): Promise<{}> => {
    const response = await axiosInstance.post(apiRoutes.qa[appID].aiAudit, edits)
    return response
}

////////////////////////////////////////////////////////////////////////////////////////////////
// PUT APIs:

// Updating existing QA forms by LOB (appID)
export const updateEditedForms = async(appID: number, forms): Promise<{}> => {
    const response = await axiosInstance.put(apiRoutes.qa[appID].forms, forms)
    return response
}

// Updating existing QA AI forms by LOB (appID)
export const updateEditedAIForms = async(appID: number, forms): Promise<{}> => {
    const response = await axiosInstance.put(apiRoutes.qa[appID].aiForms, forms)
    return response
}

////////////////////////////////////////////////////////////////////////////////////////////////
// DELETE APIs:

// Delete QA forms by LOB (appID)
export const deleteForms = async(appID: number, ids: number[]): Promise<{}> => {
    const response = await axiosInstance.put(apiRoutes.qa[appID].forms, ids)
    return response
}

// Delete QA AI forms by LOB (appID)
export const deleteAIForms = async(appID: number, ids: number[]): Promise<{}> => {
    const response = await axiosInstance.put(apiRoutes.qa[appID].aiForms, ids)
    return response
}