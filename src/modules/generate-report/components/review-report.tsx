import { useEffect, useState } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import { useReportContext } from '../reports/reports'
import { FlexMessageStatus, FlexViewer } from '../styles'
import DisplayIcon, { DisplayIconSize } from '@nielsen-media/maf-fc-display-icon'
import { ErrorOutlineIcon, InactiveIcon } from '@nielsen-media/maf-fc-icons'
import { Loading } from '../../../lib/global/components'

const ReviewReport = () => {
    const { riID, qrID, reportName, reportDate, reportData, setReportData, buildReport, pdfDoc, setRenderState } = useReportContext()

    const [status, setStatus] = useState('loading') // status of report data fetching & rendering
    const [pdfRender, setPDFRender] = useState(null)
    const [error, setError] = useState(null)

    // TESTING PARAMETERS:
    //const testDate = '2024-12-09'
    //const testQR = 'TQA04'
    //const testRI = 'H1075'

    useEffect(() => { // Load all report data using report parameters
        const loadReportData = async () => {
            if (reportName && riID) {
                try {
                    const { fetchAudioReportData } = await import('../../../lib/utils/qa-reports')
                    const { isEmpty } = await import('../../../lib/utils/shared')
                    const data = await fetchAudioReportData(reportName, riID, qrID, reportDate) // [TESTING]: fetchReportData(reportName, testRI, testQR, testDate)

                    if (data && !isEmpty(data.report)) {
                        setReportData(data)
                    } else if (!data || isEmpty(data.report)) {
                        setReportData(null)
                        setStatus('no-data')
                    } else {
                        throw new Error('Failed to load report data. Unknown error. Please troubleshoot.')
                    }
                } catch (error) {
                    setError(error.message)
                    setStatus('error')
                    setRenderState(false)
                    console.error("Failed to load report data: ", error)
                }
            }
        }
        loadReportData()
    }, [])

    useEffect(() => { // Create a new PDF report using report data and store its PDF blob
        const createPDF = async () => {
            if (reportData) {
                try {
                    await buildReport(reportName, reportData, riID, reportDate) // [TESTING]: buildReport(reportName, reportData, testRI, testDate)
                } catch (error) {
                    setError(error.message)
                    setStatus('error')
                    setRenderState(false)
                    console.error("Error generating PDF: ", error)
                }
            }
        }
        createPDF()
    }, [reportData])

    useEffect(() => { // Render document after the PDF report is created
        const renderPDF = async () => {
            if (pdfDoc) {
                try {
                    const { PDFViewer } = await import('@react-pdf/renderer')
                    setPDFRender(<PDFViewer width="100%" height="100%">{pdfDoc}</PDFViewer>)
                    setStatus('success')
                } catch (error) {
                    setRenderState(false)
                    console.error("Error rendering the document: ", error)
                }
            }
        }
        renderPDF()
    }, [pdfDoc])

    if (status === 'loading') return <Loading className="review-report" /> // Loading state

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
                        No data available today to generate for RI: {riID}.
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
                        {error}
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