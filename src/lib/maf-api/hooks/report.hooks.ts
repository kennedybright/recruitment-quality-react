import { useQuery, UseQueryOptions } from "react-query"
import reportKeys from "../query-keys/report.keys"
import { fetchForms, fetchAIForms, fetchMCAData, fetchCMRData, fetchACMData, fetchLCMData, ReportAPIParams } from "../services/report.service"
import { AxiosError } from "axios"
import { ReportCMR, ReportLCM, ReportMCA } from "../../../lib/types/reports.types"
import { isEmpty } from "../../../lib/utils/helpers"
import { getAllCMRSummaryDates, getDeviations } from "../../../lib/utils/reports/buildReport"
import { useDataContext } from "../../../lib/context/data.context"
import { getFieldsbyType } from "../../../lib/utils/qa/buildQA"

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
    const { formFields } = useDataContext()
    const fields = getFieldsbyType(formFields[1001], "scoring_dropdown").map(f => f.label)

    const { data: forms, isLoading: isLoadingForms, isError: isErrorForms, error: errorForms } = useFormData(1001, {riID: params.riID, date: params.date}, options)
    const { data: cmr, isLoading: isLoadingCMR, isError: isErrorCMR, error: errorCMR } = useCMR({riID: params.riID, date: params.date}, options)
    const { data: mca, isLoading: isLoadingMCA, isError: isErrorMCA, error: errorMCA } = useFormData(1001, {riID: params.riID, afterDate: params.afterDate}, options)

    let reportBuild: ReportDataQuery = {
        data: null,
        isLoading: isLoadingForms || isLoadingCMR || isLoadingMCA,
        isError: isErrorForms || isErrorCMR || isErrorMCA,
        error: errorForms || errorCMR || errorMCA
    }

    if (!reportBuild.isLoading && !reportBuild.isError) {
        try {
            if (forms) {
                if (isEmpty(forms)) reportBuild.data = {}
                else {
                    let cmrReport: ReportCMR[] = []
                    const formsDoNotPrint = forms.filter(form => form.do_not_print)
                    
                    if (cmr && !isEmpty(cmr)) {
                        cmrReport = cmr.sort((a, b) => a.record_number - b.record_number).map(cmrCall => { // gather all call observed differences, call notes, MCA dates for the CMR Summary
                            const recordMatch = forms.sort((a, b) => a.record_number - b.record_number).find(call => call.record_number === cmrCall.record_number)
                            const deviations = getDeviations(fields, recordMatch)

                            return recordMatch 
                                ? { ...cmrCall, final_score: +cmrCall.final_score as number, obsv_diffs: deviations, call_notes: recordMatch.call_notes } 
                                : { ...cmrCall, final_score: NaN, obsv_diffs: [], call_notes: "" }
                        })

                        // CMR Summary Data
                        if (!isEmpty(cmrReport)) {
                            const callswScores = cmrReport.filter(call => !Number.isNaN(call.final_score)) // only calculate list of calls with QA scores
                            const avgFinalScore = (callswScores.reduce((sum, form) => sum + form.final_score, 0)/cmrReport.length).toFixed(2)
                            const cmrSummaryData = {
                                total_calls: cmrReport.length,
                                total_accuracy: +avgFinalScore,
                                mca_dates: mca && !isEmpty(mca) ? getAllCMRSummaryDates(mca) : {} // get rolling 6 month MCA data
                            }

                            reportBuild.data = { 
                                report: cmrReport.filter(form => !formsDoNotPrint.some(call => call.record_number === form.record_number)), // filter out do not print calls from CMR call data
                                summary: cmrSummaryData 
                            }
                        }
                    }
                }
            }
        } catch(err) {
            console.error("Error building the CMR report: ", err)
            reportBuild.isError = true
            reportBuild.error = new AxiosError(`Error building the CMR Report: ${err}`)
        }
    }
    
    return reportBuild
}

// Custom hook for building the entire MCA report
export const useMCAReportBuild = (params: ReportAPIParams, options: UseQueryOptions<any[]> = {}): ReportDataQuery => {
    const { formFields, dropdowns } = useDataContext()
    const mcaPriorityMap = Object.fromEntries(dropdowns.mca_category.map(({ label, priority }) => [label, priority]))
    const fields = getFieldsbyType(formFields[1001], "scoring_dropdown").map(f => f.label)
    
    const { data: mca, isLoading: isLoadingMCACall, isError: isErrorMCACall, error: errorMCACall } = useMCA({riID: params.riID, date: params.date}, options)   
    const { data: mcaForm, isLoading: isLoadingForm, isError: isErrorForm, error: errorForm } = useFormData(1001, {riID: params.riID, date: params.date}, {enabled: !!mca})
    const { data: mca12Months, isLoading: isLoadingMCA12, isError: isErrorMCA12, error: errorMCA12 } = useMCA({riID: params.riID, afterDate: params.afterDate}, options)
    
    let reportBuild: ReportDataQuery = {
        data: null,
        isLoading: isLoadingMCACall || isLoadingForm || isLoadingMCA12,
        isError: isErrorMCACall || isErrorForm || isErrorMCA12,
        error: errorMCACall || errorForm || errorMCA12
    }

    if (!reportBuild.isLoading && !reportBuild.isError) {
        try {
            if (mca) {
                if (isEmpty(mca)) reportBuild.data = {}
                else {
                    let mcaData = {}

                    const mcaCall: ReportMCA = mca.length === 1 
                        ? mca[0]
                        : mca.sort((a, b) => { return (mcaPriorityMap[a.mca_category] ?? Infinity) - (mcaPriorityMap[b.mca_category] ?? Infinity)})[0] // pull first MCA call at highest priority level

                    if (mcaCall && mcaForm) {
                        mcaData = { ...mcaCall }

                        const form = mcaForm.find((mca) => mca.record_number === mcaCall.record_number) // pull call details of current MCA
                        if (form) {
                            const deviations = getDeviations(fields, form)
                            
                            mcaData = { // add remaining call details (frame code, call type, call direction, and deviations list)
                                ...mcaData,
                                frame_code_id: form.frame_code_id, 
                                call_type_id: form.call_type_id, 
                                call_direction: form.call_direction,
                                call_notes: form.call_notes, 
                                obsv_diffs: deviations
                            }
                        }

                        reportBuild.data = { report: mcaData, mcaPriors: mca12Months ?? [] }
                    }
                }
            }
        } catch(err) {
            console.error("Error building the MCA report: ", err)
            reportBuild.isError = true
            reportBuild.error = new AxiosError(`Error building the MCA Report: ${err}`)
        }
    }

    return reportBuild
}