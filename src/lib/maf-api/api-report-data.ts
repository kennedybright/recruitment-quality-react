// APIs for Form Report Data

import axios from 'axios'
import { ReportCMR, ReportLCM, ReportMCA, blobToBase64 } from '../utils/qa-reports'

const axiosInstance = axios.create({ baseURL: 'https://tqa.dev.apps.nielsen.com/api/' })

export const fetchAudioDataTEMP = async<T=any>(riID?: string, date?: string, recordNumber?: number): Promise<T[]> => {
    const response = await axiosInstance.get<T[]>('/usremoterecqa/forms/temp/audio', {
        params: { ri_id: riID, record_date: date, record_number: recordNumber }
    })
    return response.data || []
}

export const fetchAudioData = async<T=any>(riID?: string, date?: string, recordNumber?: number): Promise<T[]> => {
    const response = await axiosInstance.get<T[]>('/usremoterecqa/forms/audio/historical', {
        params: { ri_id: riID, record_date: date, record_number: recordNumber }
    })
    return response.data || []
}

export const fetchMCAData = async(riID: string): Promise<ReportMCA[]> => {
    const response = await axiosInstance.get('/usremoterecqa/reports/audio/mca', {
        params: { ri_id: riID }
    })
    return response.data || []
}

export const fetchCMRData = async(riID: string, date: string): Promise<ReportCMR[]> => {
    const response = await axiosInstance.get('/usremoterecqa/reports/audio/cmr', {
        params: { ri_id: riID, record_date: date }
    })
    return response.data || []
}

export const fetchLCMData = async(): Promise<ReportLCM[]> => {
    const response = await axiosInstance.get('/usremoterecqa/reports/audio/lcm')
    return response.data || []
}

export const fetchACMData = async <T=any>(riID?: string, date?: string, recordNumber?: number): Promise<T[]> => {
    const response = await axiosInstance.get('/usremoterecqa/reports/audio/acm', {
        params: { ri_id: riID, record_date: date, record_number: recordNumber }
    })
    return response.data || []
}

export const fetchACMDataTEMP = async <T=any>(riID?: string, date?: string, recordNumber?: number): Promise<T[]> => {
    const response = await axiosInstance.get('/usremoterecqa/reports/temp/audio/acm', {
        params: { ri_id: riID, record_date: date, record_number: recordNumber }
    })
    return response.data || []
}

export const fetchRIManager = async(riID: string): Promise<string> => {
    const response = await axiosInstance.get('/usremoterecqa/employees/rec', {
        params: { ri_id: riID }
    })
    return response.data[0]?.email_address || ""
}

export const emailReport = async(recipients: string[], pdfBlob: Blob, report: string, pdfFilename: string, qrID: string, riID: string): Promise<{}> => {
    const base64PDF = await blobToBase64(pdfBlob)
    const response = await axiosInstance.post('/usremoterecqa/emailReport',
        {
            emailTo: 'kennedy.bright@nielsen.com', //recipients,
            pdfBase64: base64PDF,
            filename: pdfFilename,
            name: report,
            ri: riID,
            qr: qrID
        }
    )
    return response.data
}
