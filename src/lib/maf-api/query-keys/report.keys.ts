import { ReportAPIParams } from "../services/report.service"

const reportKeys = {
    all: ['report'] as const,
    reportCMR: (params?: ReportAPIParams) => [...reportKeys.all, 'reportCMR', params ?? null] as const, // Call Monitoring Report for Audio/SMP
    reportMCA: (params?: ReportAPIParams) => [...reportKeys.all, 'reportMCA', params ?? null] as const, // MCA Report for Audio/SMP
    reportLCM: () => [...reportKeys.all, 'reportLCM'] as const, // Last Call Monitored Report for Audio/SMP
    reportACM: (params?: ReportAPIParams) => [...reportKeys.all, 'reportACM', params ?? null] as const, // All Calls Monitored Report for Audio/SMP
    forms: (appID: number, params?: ReportAPIParams) => [...reportKeys.all, 'forms', { appID, params: params ?? null }] as const, // Get forms data by LOB
    aiForms: (appID: number, params?: ReportAPIParams) => [...reportKeys.all, 'aiForms', { appID, params: params ?? null }] as const // Get AI-enabled forms data by LOB
}

export default reportKeys