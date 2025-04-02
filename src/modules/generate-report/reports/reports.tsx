import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react'
import { CMRReportData, MCAReportData } from '../../../lib/utils/qa-reports'
import Flex from '@nielsen-media/maf-fc-flex'
import { useDataContext } from '../../../lib/context/static-data'
import { Loading } from '../../../lib/global/components'

interface ReportContextProps {
  qrID: string
  reportDate: string
  reportName: string | ''
  setReport: (name: string | null) => void
  reportData: CMRReportData | MCAReportData | null
  setReportData: (data: CMRReportData | MCAReportData | null) => void
  resetReport: () => void
  riID: string | ''
  setRI: (ri: string) => void
  buildReport: (report: string, reportData: CMRReportData | MCAReportData, riID: string, date: string) => Promise<void>
  pdfDoc: JSX.Element | null
  pdfBlob: Blob | null
  isRendering: boolean
  setRenderState: (state: boolean) => void
  sendReport: () => Promise<string>
  emailError: string | null
  setEmailError: (error: string | null) => void
}

interface ReportProviderProps {
  children: ReactNode
  qr: string
  date: string
}

// Create the context to track the building and rendering of daily QA reports
const ReportContext = createContext<ReportContextProps>(null)

// ------------------------------------------------------------------------------- //

// Main Report Context Provider for each step (Choose Report, Review Report, Send Report)
export const ReportProvider: FC<ReportProviderProps> = ({ children, qr, date }) => {
  const [dataLoaded, setDataLoaded] = useState(false)
  const { riList } = useDataContext() // Get RI dropdown list
  useEffect(() => { // check if all static data has been loaded
    if (riList.length > 0) setDataLoaded(true)
  }, [riList])

  const [reportDate, setReportDate] = useState<string>(null)
  const [riID, setRI] = useState<string>("")

  useEffect(() => { // Format report date in format: MM/DD/YYYY
    const formatDate = async() => {
      const { formatDateTime } = await import('../../../lib/utils/shared')
      const { formattedDate } = formatDateTime(date)
      setReportDate(formattedDate)
    }
    formatDate()
  }, [])

  // Global report states
  const [reportName, setReport] = useState<string>('')
  const [reportData, setReportData] = useState(null)
  const [isRendering, setRenderState] = useState<boolean>(true)
  const [document, setDocument] = useState(null)
  const [pdfBlob, setPDFBlob] = useState<Blob>(null)
  const [emailError, setEmailError] = useState<string>(null)

  // Clear report, document, and blob
  const resetReport = () => { 
    setReport(null)
    setRI("")
    setDocument(null)
    setPDFBlob(null) 
  }

  // Build PDF report using report params 
  const buildReport = async (report: string, reportData: CMRReportData | MCAReportData, riID: string, date: string) => {
    if (report === "Call Monitoring Report") {
      await import('./report-cmr').then(async ({ReportCMR}) => {
        const pdfDoc = ReportCMR({data: reportData, ri: riID, date: reportDate})
        setDocument(pdfDoc)
        await generatePDF(pdfDoc)
      })
    }

    if (report === "MCA Report") {
      await import('./report-mca').then(async ({ReportMCA}) => {
        const pdfDoc = ReportMCA({data: reportData, ri: riID, date: reportDate})
        setDocument(pdfDoc)
        await generatePDF(pdfDoc)
      })
    }
  }

  // Setter method for PDF document's Blob
  const generatePDF = async (doc: JSX.Element) => {
    try {
      if (doc) {
        const { pdf } = await import('@react-pdf/renderer')
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
      const { emailReport } = await import('../../../lib/maf-api/api-report-data')
      const filename = `${reportName} - ${reportDate} - ${riID}`

      // 'uscallcenterqualityaudio@nielsen.com'
      let recipients = []
      if (riID[0] === "J") recipients.push('uscallcenteraudiogdlqualityreporting@nielsen.com') // add GDL distribution email to receipients list
      recipients.push('uscallcenteraudioops@nielsen.com', 'joy.saldana@nielsen.com') // add current QA Team Lead email: Joy Saldana (01/27/2024)

      await emailReport(recipients, pdfBlob, reportName, filename, qr, riID)
      return "success"
    } catch (error) {
      console.error("Error sending report: ", error)
    }
  }

  // loading state
  if (!dataLoaded) return <Flex justifyContent='center' alignContent='center'><Loading className="content-loading" /></Flex>
  
  return (
    <ReportContext.Provider 
      value={{
        qrID: qr,
        reportDate,
        reportName,
        setReport,
        resetReport,
        riID,
        setRI,
        reportData,
        setReportData,
        buildReport,
        pdfDoc: document,
        pdfBlob,
        isRendering,
        setRenderState,
        sendReport,
        emailError,
        setEmailError
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