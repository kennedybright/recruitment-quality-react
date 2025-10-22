import { useEffect, useMemo, useState } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import { useReportContext } from '../components/reports'
import { FlexMessageStatus, FlexViewer } from '../styles'
import DisplayIcon, { DisplayIconSize } from '@nielsen-media/maf-fc-display-icon'
import { ErrorOutlineIcon, InactiveIcon } from '@nielsen-media/maf-fc-icons'
import { Loading } from '../../../lib/components/feedback/LoaderSpinner'
import { FETCHSTATUS, isEmpty } from '../../../lib/utils/helpers'
import { useCMRReportBuild, useMCAReportBuild } from '../../../lib/maf-api/hooks/report.hooks'
import { formatPickerAsDate } from '../../../lib/utils/formatDateTime'
import { useDataContext } from '../../../lib/context/data.context'
import { getFieldsbyType } from '../../../lib/utils/qa/buildQA'
import { CMRReportData, MCAReportData, ReportCMR, ReportMCA } from '../../../lib/types/reports.types'
import { getAllCMRSummaryDates, getDeviations } from '../../../lib/utils/reports/buildReport'
import { PDFViewer } from '@react-pdf/renderer'

const ReviewReport = () => {
    const { formFields } = useDataContext()
    const { riID, reportName, reportDate, buildPDFReport, pdfDoc, setRenderState } = useReportContext()

    const [status, setStatus] = useState<FETCHSTATUS>('loading') // status of report data fetching & rendering
    const [pdfRender, setPDFRender] = useState(null)
    const [renderError, setRenderError] = useState<string>(null)

    const afterDate = useMemo(() => {
        if (reportName && reportDate) {
            const reportStartDate = new Date(formatPickerAsDate(reportDate))
            const monthsAgo = reportName === "Call Monitoring Report" 
                ? new Date(new Date().setMonth(reportStartDate.getMonth()-6)).toISOString().split("T")[0] // 6 months from the report date
                : new Date(new Date().setMonth(reportStartDate.getMonth()-12)).toISOString().split("T")[0] // 12 months from the report date

            return monthsAgo
        }
        return null
    }, [reportName, reportDate])
    
    const { data: cmrReportData, isLoading: isLoadingCMR, isError: isErrorCMR, error: errorCMR } = useCMRReportBuild(
            {riID: riID, date: formatPickerAsDate(reportDate), afterDate: afterDate},
            {enabled: reportName === 'Call Monitoring Report' && !!riID && !!reportDate && !!afterDate}
        )

    const { data: mcaReportData, isLoading: isLoadingMCA, isError: isErrorMCA, error: errorMCA } = useMCAReportBuild(
            {riID: riID, date: formatPickerAsDate(reportDate), afterDate: afterDate},
            {enabled: reportName === 'MCA Report' && !!riID && !!reportDate && !!afterDate}
        )
        
    const { data, isLoading, isError, error } = useMemo(() => {
        if (reportName === 'Call Monitoring Report' && cmrReportData) {
            return { data: cmrReportData, isLoading: isLoadingCMR, isError: isErrorCMR, error: errorCMR }
        }

        if (reportName === 'MCA Report' && mcaReportData) {
            return { data: mcaReportData, isLoading: isLoadingMCA, isError: isErrorMCA, error: errorMCA }
        }

        return { data: null, isLoading: false, isError: false, error: null }
    }, [reportName, cmrReportData, isLoadingCMR, isErrorCMR, errorCMR, mcaReportData, isLoadingMCA, isErrorMCA, errorMCA])
    console.log("data", data, isLoading, isError, error)

    const reportData: CMRReportData | MCAReportData = useMemo(() => {
        if (!data) return null

        const fields = getFieldsbyType(formFields[1001], "scoring_dropdown").map(f => f.label)
        
        if (reportName === 'Call Monitoring Report') {
            try {
                let cmrReport: ReportCMR[] = []
        
                const forms = data.forms ?? [] // pull all calls details from RI on current date
                if (!isEmpty(forms)) {
                    const formsDoNotPrint = forms.filter(form => form.do_not_print)
                    const cmrData = data.cmr ?? []
                    const mcaData = data.mca ?? []
                    
                    if (!isEmpty(cmrData)) {
                        cmrReport = cmrData.map(recordA => { // gather all call observed differences, call notes, MCA dates for the CMR Summary
                            const recordMatch = forms.sort((a, b) => a.record_number - b.record_number).find(recordB => recordB.record_number === recordA.record_number)
                            const finalScoreNum: number = +recordA.final_score

                            const deviations = getDeviations(fields, recordMatch)
        
                            return recordMatch ? { ...recordA, final_score: finalScoreNum, obsv_diffs: deviations, call_notes: recordMatch.call_notes } : { ...recordA, final_score: NaN, obsv_diffs: [], call_notes: "" }
                        })
    
                        // CMR Summary Data
                        if (!isEmpty(cmrReport)) {
                            const callswScores = cmrReport.filter(call => !Number.isNaN(call.final_score)) // only calculate list of calls with QA scores
                            const avgFinalScore = (callswScores.reduce((sum, form) => sum + form.final_score, 0)/cmrReport.length).toFixed(2)
                            const cmrSummaryData = {
                                total_calls: cmrReport.length,
                                total_accuracy: +avgFinalScore,
                                mca_dates: !isEmpty(mcaData) ? getAllCMRSummaryDates(mcaData) : {} // get rolling 6 month MCA data
                            }

                            return { 
                                report: cmrReport.filter(form => !formsDoNotPrint.some(call => call.record_number === form.record_number)), // filter out do not print calls from CMR call data
                                summary: cmrSummaryData 
                            }
                        }
                    }
                }
    
                return null
            } catch(err) {
                console.error("Error loading CMR report data: ", err)
                return null
            }
        }

        if (reportName === 'MCA Report') {
            try {
                let mcaData: any = {}
                const mcaCall: ReportMCA = data.mcaCall ? data.mcaCall[0] : null // pull first MCA call from RI and record date

                if (mcaCall) {
                    const form = data.form ?? [] // pull call details of current MCA

                    if (!isEmpty(form)) {
                        const deviations = getDeviations(fields, form)
                        
                        mcaData = { // add remaining call details (frame code, call type, call direction, and deviations list)
                            ...mcaCall, 
                            frame_code_id: form.frame_code_id, 
                            call_type_id: form.call_type_id, 
                            call_direction: form.call_direction,
                            call_notes: form.call_notes, 
                            obsv_diffs: deviations
                        }
                    }
                    return { report: mcaData, mcaPriors: data.mca12 ?? [] }
                }
                
                return null
            } catch(err) {
                console.error("Error loading MCA data: ", err)
                return null
            }
        }

        return null
    }, [reportName, data])

    console.log("report data", reportData)

    //Load all report data using report parameters
    useEffect(() => {
        if (!reportName || !riID || !reportDate) return

        if (isLoading) {
            setStatus('loading')
        } else if (isError) {
            setRenderError(error.message)
            setRenderState(false)
            setStatus('error')
            console.error("Failed to load report data: ", error)
        } else if (!isLoading && !isError && !reportData) {
            setStatus('no-data')
        }
    }, [reportName, riID, reportDate, reportData, isLoading, isError])

    useEffect(() => { // Create a new PDF report using report data and store its PDF blob
        const createPDF = async () => {
            if (status === 'loading' && reportData) {
                try {
                    await buildPDFReport(reportName, reportData)
                } catch (err) {
                    setRenderError(err.message)
                    setRenderState(false)
                    setStatus('error')
                    console.error("Error generating PDF: ", error)
                }
            } 
        }

        createPDF()
    }, [status, reportName, reportData])

    useEffect(() => { // Render document after the PDF report is created
        if (!pdfDoc) return

        try {
            setPDFRender(<PDFViewer width="100%" height="100%">{pdfDoc}</PDFViewer>)
            setStatus('success')
        } catch (err) {
            setRenderError(err.message)
            setRenderState(false)
            setStatus('error')
            console.error("Error rendering the document: ", error)
        }
    }, [pdfDoc])

    if (status === 'loading') return <Loading id="review-report" /> // Loading state

    if (status === 'no-data') { // No Data Available 
        return (
            <Flex className='review-report' column alignItems='center' justifyContent='center'>
                <FlexMessageStatus className="render-status-message" flexDirection='column'>
                    <DisplayIcon
                        icon={InactiveIcon}
                        size={DisplayIconSize.s700}
                        variant='warning'
                    />
                    <Text className="no-data-available" fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold} textAlign='center'>
                        No data available for {formatPickerAsDate(reportDate)} to generate for RI: {riID}.
                    </Text>
                </FlexMessageStatus>
            </Flex>
        )
    }
    
    if (status === 'error') { // Data Load or PDF Render Error
        return (
            <Flex className='review-report' column alignItems='center' justifyContent='center'>
                <FlexMessageStatus className="render-status-message" flexDirection='column'>
                    <DisplayIcon
                        icon={ErrorOutlineIcon}
                        size={DisplayIconSize.s700}
                        variant='danger'
                    />
                    <Text className="error-status-message" fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold} textAlign='center'>
                        Report failed to load. Please go back and try again. See error message below:
                    </Text>
                    <Text className="error-message" fontSize={Text.FontSize.s400} fontWeight={Text.FontWeight.bold} textAlign='center'>
                        {renderError}
                    </Text>
                </FlexMessageStatus>
            </Flex>
        )
    }

    if (status === 'success') { // PDF Rendering Display
        return (
            <Flex className='review-report' column alignItems='center' justifyContent='center'>
                <FlexViewer className='pdf-viewer'>{pdfRender}</FlexViewer>
            </Flex>
        )
    }
}

export default ReviewReport