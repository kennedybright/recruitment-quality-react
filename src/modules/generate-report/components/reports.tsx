import { createContext, useContext, useState, useEffect, FC } from 'react'
import Flex from '@nielsen-media/maf-fc-flex'
import { useDataContext } from '../../../lib/context/data.context'
import { CMRReportData, MCAReportData } from '../../../lib/types/reports.types'
import { Loading } from '../../../lib/components/feedback/LoaderSpinner'
import { PartialPickerDate } from '@nielsen-media/maf-fc-date-picker'
import { pdf } from '@react-pdf/renderer'
import { useMAFContext } from '../../../maf-api'
import { formatPickerAsDate } from '../../../lib/utils/formatDateTime'

interface ReportContextProps {
    qrID: string
    reportDate: PartialPickerDate
    setReportDate: React.Dispatch<React.SetStateAction<PartialPickerDate>>
    reportName: string
    setReport: React.Dispatch<React.SetStateAction<string>>
    resetReport: () => void
    riID: string
    setRI: React.Dispatch<React.SetStateAction<string>>
    buildPDFReport: (report: string, reportData: CMRReportData | MCAReportData) => Promise<void>
    pdfDoc: JSX.Element
    pdfBlob: Blob
    isRendering: boolean
    setRenderState: React.Dispatch<React.SetStateAction<boolean>>
    emailSent: boolean
    setEmailSent: React.Dispatch<React.SetStateAction<boolean>>
    sendReport: () => Promise<string>
    emailError: string
    setEmailError: React.Dispatch<React.SetStateAction<string>>
    exit: () => void
}

// Create the context to track the building and rendering of daily QA reports
const ReportContext = createContext<ReportContextProps>(null)

// ------------------------------------------------------------------------------- //

// Main Report Context Provider for each step (Choose Report, Review Report, Send Report)
export const ReportProvider: FC = ({ children }) => {
    const { actions: { navigate } } = useMAFContext()
    const [dataLoaded, setDataLoaded] = useState(false)
    const { currentUser, dropdowns } = useDataContext() // Get RI dropdown list
    
    useEffect(() => { // check if all static data has been loaded
        if (dropdowns.ri_id && dropdowns.ri_id.length > 0) setDataLoaded(true)
    }, [dropdowns.ri_id])

    // Global report states
    const [reportName, setReport] = useState<string>(null)
    const [reportDate, setReportDate] = useState<PartialPickerDate>(undefined)
    const [riID, setRI] = useState<string>(null)
    const [isRendering, setRenderState] = useState<boolean>(true)
    const [document, setDocument] = useState(null)
    const [pdfBlob, setPDFBlob] = useState<Blob>(null)
    const [emailSent, setEmailSent] = useState<boolean>(false)
    const [emailError, setEmailError] = useState<string>(null)

    // Clear report, document, and blob
    const resetReport = () => { 
        setReport(null)
        setRI(null)
        setReportDate(null)
        setDocument(null)
        setPDFBlob(null)
        setEmailSent(false) 
    }

    const exit = () => {
        console.log(`Starting a new session...`)
        resetReport()
        window.location.reload() // refresh the page
    }

    // Build PDF report using report params 
    const buildPDFReport = async (report: string, reportData: CMRReportData | MCAReportData) => {
        const formattedDate = formatPickerAsDate(reportDate)

        if (report === "Call Monitoring Report") {
            await import('./reportCMR').then(async ({ReportCMR}) => {
                const pdfDoc = ReportCMR({data: reportData, ri: riID, date: formattedDate})
                setDocument(pdfDoc)
                await generatePDF(pdfDoc)
            })
        }

        if (report === "MCA Report") {
            await import('./reportMCA').then(async ({ReportMCA}) => {
                const pdfDoc = ReportMCA({data: reportData, ri: riID, date: formattedDate})
                setDocument(pdfDoc)
                await generatePDF(pdfDoc)
            })
        }
    }

    // Setter method for PDF document's Blob
    const generatePDF = async (doc: JSX.Element) => {
        try {
            if (doc) {
                const blob = await pdf(doc).toBlob()
                setPDFBlob(blob)
            }
        } catch(error) {
            console.error("Error retrieving blob data of PDF document: ", error)
        }
    }

    // Send report to US Call Center Quality Ops distribution email
    const sendReport = async () => {
        try {
            const { emailReport } = await import('../../../lib/maf-api/services/email.service')
            const filename = `${reportName} - ${formatPickerAsDate(reportDate)} - ${riID}`

            let recipients = []
            if (riID[0] === "J") recipients.push('uscallcenteraudiogdlqualityreporting@nielsen.com') // add GDL distribution email to receipients list
            recipients.push('uscallcenteraudioops@nielsen.com', 'joy.saldana@nielsen.com') // add current QA Team Lead email: Joy Saldana (01/27/2024)

            await emailReport(recipients, pdfBlob, reportName, filename, currentUser.qrID, riID)
            return 'success'
        } catch (error) {
            console.error("Error sending report: ", error)
            return 'error'
        }
    }

    // loading state
    if (!dataLoaded) return <Flex justifyContent='center' alignContent='center'><Loading id="content-loading" /></Flex>
  
    return (
        <ReportContext.Provider 
            value={{
                qrID: currentUser.qrID,
                reportDate,
                setReportDate,
                reportName,
                setReport,
                resetReport,
                riID,
                setRI,
                buildPDFReport,
                pdfDoc: document,
                pdfBlob,
                isRendering,
                setRenderState,
                sendReport,
                emailSent,
                setEmailSent,
                emailError,
                setEmailError,
                exit
            }}
        >
            {dataLoaded && children}
        </ReportContext.Provider>
    )
}

// Custom hook to use the form context
export const useReportContext = () => {
    const context = useContext(ReportContext)
    if (!context) throw new Error("useReportContext must be used within a ReportProvider")
    return context
}