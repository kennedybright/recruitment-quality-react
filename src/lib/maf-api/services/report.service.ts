// APIs for Report/Analytics Data

import { ReportCMR, ReportLCM, ReportMCA } from '../../types/reports.types'
import axiosInstance from '../client/axiosInstance'
import { apiRoutes } from '../client/apiRoutes'

export type ReportAPIParams = {
    recordNumber?: number
    riID?: string
    date?: string
    beforeDate?: string
    afterDate?: string
}

// Fetch QA forms by LOB (appID)
export const fetchForms = async<T=any>(appID: number, params?: ReportAPIParams): Promise<T[]> => {
    const response = await axiosInstance.get<T[]>(apiRoutes.qa[appID].forms, {
        params: { ri_id: params.riID, record_date: params.date, record_number: params.recordNumber, before_date: params.beforeDate, after_date: params.afterDate }
    })
    return response.data || []
}

// Fetch QA AI forms by LOB (appID)
export const fetchAIForms = async<T=any>(appID: number, params?: ReportAPIParams): Promise<T[]> => {
    const response = await axiosInstance.get<T[]>(apiRoutes.qa[appID].aiForms, {
        params: { ri_id: params.riID, record_date: params.date, record_number: params.recordNumber, before_date: params.beforeDate, after_date: params.afterDate }
    })
    return response.data || []
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Specific Report Views:

// Fetch the MCA Report data
export const fetchMCAData = async(params?: ReportAPIParams): Promise<ReportMCA[]> => {
    const response = await axiosInstance.get(apiRoutes.report.reportMCA, {
        params: { ri_id: params.riID, record_date: params.date, before_date: params.beforeDate, after_date: params.afterDate }
    })
    return response.data || []
}

// Fetch the Call Monitoring Report data
export const fetchCMRData = async(params?: ReportAPIParams): Promise<ReportCMR[]> => {
    const response = await axiosInstance.get(apiRoutes.report.reportCMR, {
        params: { ri_id: params.riID, record_date: params.date, before_date: params.beforeDate, after_date: params.afterDate }
    })
    return response.data || []
}

// Fetch the Last Call Monitored Report data
export const fetchLCMData = async(): Promise<ReportLCM[]> => {
    const response = await axiosInstance.get(apiRoutes.report.reportLCM)
    return response.data || []
}

// Fetch the All Calls Monitored Report data
export const fetchACMData = async <T=any>(params?: ReportAPIParams): Promise<T[]> => {
    const response = await axiosInstance.get(apiRoutes.report.reportACM, {
        params: { ri_id: params.riID, record_date: params.date, after_date: params.afterDate, record_number: params.recordNumber }
    })
    return response.data || []
}