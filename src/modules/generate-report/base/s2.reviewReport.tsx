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
import { CMRReportData, MCAReportData } from '../../../lib/types/reports.types'
import { PDFViewer } from '@react-pdf/renderer'

const ReviewReport = () => {
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
    
    const { data: cmrReport, isLoading: isLoadingCMR, isError: isErrorCMR, error: errorCMR } = useCMRReportBuild(
            {riID: riID, date: formatPickerAsDate(reportDate), afterDate: afterDate},
            {enabled: reportName === 'Call Monitoring Report' && !!riID && !!reportDate && !!afterDate}
        )

    const { data: mcaReport, isLoading: isLoadingMCA, isError: isErrorMCA, error: errorMCA } = useMCAReportBuild(
            {riID: riID, date: formatPickerAsDate(reportDate), afterDate: afterDate},
            {enabled: reportName === 'MCA Report' && !!riID && !!reportDate && !!afterDate}
        )
        
    const { data: reportData, isLoading, isError, error } = useMemo(() => {
        if (reportName === 'Call Monitoring Report' && cmrReport) {
            return { data: cmrReport as CMRReportData, isLoading: isLoadingCMR, isError: isErrorCMR, error: errorCMR }
        }

        if (reportName === 'MCA Report' && mcaReport) {
            return { data: mcaReport as MCAReportData, isLoading: isLoadingMCA, isError: isErrorMCA, error: errorMCA }
        }

        return { data: null, isLoading: false, isError: false, error: null }
    }, [reportName, cmrReport, isLoadingCMR, isErrorCMR, errorCMR, mcaReport, isLoadingMCA, isErrorMCA, errorMCA])

    //Set report status using report parameters
    useEffect(() => {
        if (!reportName || !riID || !reportDate) return

        if (isLoading) {
            setStatus('loading')
        } else if (isError) {
            setRenderError(error.message)
            setRenderState(false)
            setStatus('error')
            console.error("Failed to load report data: ", error)
        } else if (!isLoading && !isError && (reportData && isEmpty(reportData))) {
            setStatus('no-data')
        }
    }, [reportName, riID, reportDate, reportData, isLoading, isError])

    useEffect(() => { // Create a new PDF report using report data and store its PDF blob
        const createPDF = async () => {
            if (!reportData) return
            
            if (status === 'loading' && !isEmpty(reportData)) {
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
    }, [status, reportData])

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