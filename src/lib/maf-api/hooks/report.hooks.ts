import { useQuery, UseQueryOptions } from "react-query"
import reportKeys from "../query-keys/report.keys"
import { fetchForms, fetchAIForms, fetchMCAData, fetchCMRData, fetchACMData, fetchLCMData, ReportAPIParams } from "../services/report.service"
import { AxiosError } from "axios"
import { ReportCMR, ReportLCM, ReportMCA } from "../../../lib/types/reports.types"

export type ReportDataQuery = {
    isLoading: boolean
    isError: boolean
    data: Record<string, any>
    error: AxiosError<unknown, any> | null
}

export const useFormData = (appID: number, params?: ReportAPIParams, options: UseQueryOptions<any[]> = {}) => {
    return useQuery<any[], AxiosError>({
        queryKey: reportKeys.forms(appID, params),
        queryFn: () => fetchForms(appID, params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: options.enabled ?? true,
        ...options
    })
}

export const useAIFormData = (appID: number, params?: ReportAPIParams, options: UseQueryOptions<any[]> = {}) => {
    return useQuery<any[], AxiosError>({
        queryKey: reportKeys.aiForms(appID, params),
        queryFn: () => fetchAIForms(appID, params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: options.enabled ?? true,
        ...options
    })
}

export const useMCA = (params?: ReportAPIParams, options: UseQueryOptions<any[]> = {}) => {
    return useQuery<ReportMCA[], AxiosError>({
        queryKey: reportKeys.reportMCA(params),
        queryFn: () => fetchMCAData(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: !!params && (options.enabled ?? true),
        ...options
    })
}

export const useCMR = (params?: ReportAPIParams, options: UseQueryOptions<any[]> = {}) => {
    return useQuery<ReportCMR[], AxiosError>({
        queryKey: reportKeys.reportCMR(params),
        queryFn: () => fetchCMRData(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: !!params && (options.enabled ?? true),
        ...options
    })
}

export const useLCM = () => {
    return useQuery<ReportLCM[], AxiosError>({
        queryKey: reportKeys.reportLCM(),
        queryFn: () => fetchLCMData(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    })
}

export const useACM = (params?: ReportAPIParams) => {
    return useQuery<any[], AxiosError>({
        queryKey: reportKeys.reportACM(params),
        queryFn: () => fetchACMData(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: !!params,
    })
}

// Custom hook for building the entire CMR report
export const useCMRReportBuild = (params: ReportAPIParams, options: UseQueryOptions<any[]> = {}): ReportDataQuery => {
    const { data: forms, isLoading: isLoadingForms, isError: isErrorForms, error: errorForms } = useFormData(1001, {riID: params.riID, date: params.date}, options)
    const { data: cmrData, isLoading: isLoadingCMR, isError: isErrorCMR, error: errorCMR } = useCMR({riID: params.riID, date: params.date}, options)
    const { data: mcaData, isLoading: isLoadingMCA, isError: isErrorMCA, error: errorMCA } = useFormData(1001, {riID: params.riID, afterDate: params.afterDate}, options)
    
    return {
        isLoading: isLoadingForms || isLoadingCMR || isLoadingMCA,
        isError: isErrorForms || isErrorCMR || isErrorMCA,
        data: {
            forms: forms,
            cmr: cmrData,
            mca: mcaData
        },
        error: errorForms || errorCMR || errorMCA
    }
}

// Custom hook for building the entire MCA report
export const useMCAReportBuild = (params: ReportAPIParams, options: UseQueryOptions<any[]> = {}): ReportDataQuery => {
    const { data: mcaData, isLoading: isLoadingMCACall, isError: isErrorMCACall, error: errorMCACall } = useMCA({riID: params.riID, date: params.date}, options)    
    const { data: form, isLoading: isLoadingForm, isError: isErrorForm, error: errorForm } = useFormData(1001, {recordNumber: mcaData?.[0].record_number}, {enabled: !!mcaData})
    const { data: mca12Months, isLoading: isLoadingMCA12, isError: isErrorMCA12, error: errorMCA12 } = useMCA({riID: params.riID, afterDate: params.afterDate}, options)

    return {
        isLoading: isLoadingMCACall || isLoadingForm || isLoadingMCA12,
        isError: isErrorMCACall || isErrorForm || isErrorMCA12,
        data: {
            mcaCall: mcaData,
            form: form,
            mca12: mca12Months
        },
        error: errorMCACall || errorForm || errorMCA12
    }
}