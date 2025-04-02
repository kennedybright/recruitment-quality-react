// All Report Interfaces and helper functions to generate monitoring reports
import { ColumnDef, MAFColumnExtensions, TableData } from '@nielsen-media/maf-fc-table2'
import { fetchCalltypes, fetchFormFields, fetchFramecodes } from "../maf-api/api-form-data"
import { fetchAudioData, fetchCMRData, fetchMCAData, fetchAudioDataTEMP } from "../maf-api/api-report-data"
import { isEmpty } from "./shared"
import { FieldCatg } from "../context/static-data"
import { useMemo } from 'react'

interface CMRSummary {
    total_calls: number
    total_accuracy: number
    mca_dates: CMRSummaryDates
}

interface CMRSummaryDates {
    improper_intro?: string[]
    inaccurate_data?: string[]
    leading_bias?: string[]
    verbatim_break?: string[]
    mandatory_text?: string[]
    incorrect_disposition?: string[]
    delayed_coding?: string[]
    address?: string[]
    persuading?: string[]
}

export interface ReportCMR {
    qr_id: string
	ri_id: string
    site_name_id: string
    record_date: string
    record_time: string
    record_number: number
    audio_smp: string
	frame_code_id: string
    call_type_id: string
    ri_shift: string
	sample_id: number
    call_direction: string
    disposition: string
    total_opportunities: number
    total_deviations: number
    final_score: number
}

export interface ReportMCA {
    audio_smp: string
    record_number: number
	qr_id: string
	ri_id: string
	sample_id: number
    record_date: string
    record_time: string
    ri_shift: string
    disposition: string
    mca_category: string
    mca_summary_observation: string | null
    call_notes: string | null
    site_name_id: string
}

export interface ReportLCM {
    ri_id: string
    total_calls_monitored: number
	total_live_calls: number
	last_date_monitored: string
	last_qr: string
    last_study: string
    date_diff: number
}

export interface CMRReportData { // Full CMR Report data
    report: ReportCMR[]
    summary?: CMRSummary | {}
}

export interface MCAReportData { // Full MCA Report data
    report: {}
    mcaPriors?: ReportMCA[]
}

interface LegendData {
    callTypes: FieldCatg[]
    frameCodes: FieldCatg[]
    questionFields: string[]
}

// Fetch all legend data
export async function getLegendData(): Promise<LegendData> {
    let reportLegend: LegendData = null
    if (!reportLegend) {
        try {
            const [calltypes, framecodes, questions] = await Promise.all([fetchCalltypes(), fetchFramecodes(), fetchFormFields(1001, "Dropdown")])
            const questionfields = questions.sort((a, b) => a.id - b.id).map((q) => {
                // Replace dashes and convert string to title case
                if (q.name.includes("Hh")) return q.name.replace("Hh", "HH")
                if (q.name.includes("Tv")) return q.name.replace("Tv", "TV")
                if (q.name.includes("Vmvpd")) return q.name.replace("Vmvpd", "vMVPD")
                return q.name
            })
            reportLegend = { callTypes: calltypes, frameCodes: framecodes, questionFields: questionfields }
        } catch (err) {
            console.error("Error fetching legend data: ", err)
            reportLegend  = { callTypes: [], frameCodes: [], questionFields: [] }
        }
        return reportLegend
    }
}

// Retrieve and format Audio/SMP form report data for the report
export async function fetchAudioReportData(report:string, riID: string, qrID: string, date: string): Promise<CMRReportData | MCAReportData> {
    const { questionFields } = await getLegendData()
    const fieldsLower = questionFields.map(q => q.toLowerCase())

    if (report === 'Call Monitoring Report') {
        try {
            let cmrReport: ReportCMR[] = []
            const forms = await fetchAudioDataTEMP(riID, date) // fetchFormData(riID, date) // pull all calls details from RI on current date
            if (!isEmpty(forms)) {
                const now = new Date()
                const sixMonthsAgo = new Date(new Date().setMonth(now.getMonth()-6))

                const cmrData = await fetchCMRData(riID, date) // pull qa scoring details from RI on current date
                let mca_dates_data: CMRSummaryDates = {}
                if (!isEmpty(cmrData)) {
                    cmrReport = cmrData.map(recordA => { // gather all call observed differences, call notes, MCA dates for the CMR Summary
                        const recordMatch = forms.find(recordB => recordB.record_number === recordA.record_number)
                        const finalScoreNum: number = +recordA.final_score
    
                        const deviations: number[] = []
                        Object.entries(recordMatch).forEach((field) => { // gather all observed differences of the call
                            const fieldLower = field[0].replaceAll("_", " ").toLowerCase()
                            if (fieldsLower.includes(fieldLower) && field[1] === -1) {
                                const deviationDiff = fieldsLower.indexOf(field[0])+1
                                deviations.push(deviationDiff) // append deviated question number
                            }
                        })
    
                        // get rolling 6 month MCA data
                        const formDate = new Date(recordMatch.record_date)
                        if (formDate >= sixMonthsAgo && formDate <= now) { // get record_date within 6 months of forms data
                            // append record date to corresponding deviation
                            if (recordMatch.mailing_address === -1) mca_dates_data.address.push(recordMatch.record_date)
                            if (recordMatch.home_address === -1) mca_dates_data.address.push(recordMatch.record_date)
                            if (recordMatch.coding === -1) mca_dates_data.delayed_coding.push(recordMatch.record_date)
                            if (recordMatch.overcoming_objections === -1) mca_dates_data.persuading.push(recordMatch.record_date)
                            if (recordMatch.disposition === "INCORRECT") mca_dates_data.incorrect_disposition.push(recordMatch.record_date)
    
                            // append record date to corresponding mca
                            if (recordMatch.verbatim_break === true) mca_dates_data.verbatim_break.push(recordMatch.record_date)
                            if (recordMatch.inaccurate_data === true) mca_dates_data.inaccurate_data.push(recordMatch.record_date)
                            if (recordMatch.improper_intro === true) mca_dates_data.improper_intro.push(recordMatch.record_date)
                            if (recordMatch.mandatory_text === true) mca_dates_data.mandatory_text.push(recordMatch.record_date)
                            if (recordMatch.leading_bias === true) mca_dates_data.leading_bias.push(recordMatch.record_date)
                        }
    
                        return recordMatch ? { ...recordA, final_score: finalScoreNum, obsv_diffs: deviations, call_notes: recordMatch.call_notes } : { ...recordA, final_score: NaN, obsv_diffs: [], call_notes: "" }
                    })

                    // CMR Summary Data
                    if (!isEmpty(cmrReport)) {
                        const callswScores = cmrReport.filter(call => !Number.isNaN(call.final_score)) // only calculate list of calls with QA scores
                        const avgFinalScore = (callswScores.reduce((sum, form) => sum + form.final_score, 0)/cmrReport.length).toFixed(2)
                        const cmrSummaryData = {
                            total_calls: cmrReport.length,
                            total_accuracy: +avgFinalScore,
                            mca_dates: mca_dates_data
                        }
                        return { report: cmrReport, summary: cmrSummaryData }
                    }
                }
            }

            return { report: cmrReport }
        } catch(err) {
            console.error("Error fetching CMR data: ", err)
        }
    }

    if (report === 'MCA Report') {
        try {
            let mcaCall: any = {}
            let mcaData: ReportMCA[] = await fetchMCAData(riID) // pull all current & prior MCAs from the RI

            if (!isEmpty(mcaData)) {
                mcaCall = mcaData?.find(mca => mca.record_date === date && mca.ri_id === riID && mca.qr_id === qrID) // pull current MCA of RI

                if (mcaCall) {
                    const form: any = await fetchAudioDataTEMP(riID, date, mcaCall.record_number) // await fetchAudioData(riID, date, mcaCall.record_number) pull call details of current MCA
                    let deviations: number[] = []

                    if (!isEmpty(form)) {
                        const call = form[0]
                        Object.entries(call).forEach((field) => { // gather all observed differences of the call
                            const fieldLower = field[0].replaceAll("_", " ").toLowerCase()
                            if (fieldsLower.includes(fieldLower) && field[1] === -1) {
                                const deviationDiff = fieldsLower.indexOf(field[0])+1
                                deviations.push(deviationDiff) // append deviated question number
                            }
                        })
                        mcaCall = { // add remaining call details (frame code, call type, call direction, and deviations list)
                            ...mcaCall, 
                            frame_code_id: call.frame_code_id, 
                            call_type_id: call.call_type_id, 
                            call_direction: call.call_direction,
                            call_notes: call.call_notes, 
                            obsv_diffs: deviations
                        }
                    }
                    return { report: mcaCall, mcaPriors: mcaData }
                }
            }
            
            return { report: mcaCall }
        } catch(err) {
            console.error("Error fetching MCA data: ", err)
        }
    }
}

// Format observed differences on the CMR report
export function formatErrorAreas(areas) {
    if (!areas || !areas.length) return ""
    return areas.map((num) => `[${num}]`).join("  ")
}

// Conditional formatting map for Monitoring Accuracy
const accuracyFormatting = {
    red: {
      max: 90,
      hex: "#E3071D",
    },
    yellow: {
      max: 98,
      hex: "#EEBA2B",
    },
    green: {
      max: 100,
      hex: "#62CC69",
    },
}

// Format monitoring accuracy based on percentage
export function getAccuracyColor(ptg) {
    let hex = ""
    const colors = Object.values(accuracyFormatting)
    for (let i = 0; i < colors.length; i++) {
      if (ptg < colors[i].max) {
        hex = colors[i].hex
        break;
      } else {
        hex = accuracyFormatting.green.hex
      }
    }
    return hex
}

// Extract the base64 string from PDF Blob
export function blobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const dataURL = reader.result.toString()
            const base64 = dataURL.replace('data:application/pdf;base64,', '') // strip metadata
            resolve(base64)
        }
        reader.onerror = (error) => reject(error)
        reader.readAsDataURL(blob)
    })
}

// Custom hook function to format table data for Table2 component
export function useMakeData<T extends Record<string, any>>(initData:T[]): TableData[] {
    return initData.map((item, index) => ({ id: index+1, ...item }))
}

// Custom hook function to format table data for Table2 component
export function useMakeColumns<T extends Record<string, any>>(initData:T[], extensions?:MAFColumnExtensions, columnProps?:{id: string, props: Partial<ColumnDef<T>>}[]): ColumnDef<TableData>[] {
    return Object.keys(initData[0]).map((key) => {
        if (columnProps) {
            const colProps = columnProps.find(props => props.id === key)?.props
            const column: ColumnDef<TableData> = {
                id: key,
                header: key.replaceAll(/_/g, " ").toUpperCase(), // Format column header text
                accessorKey: key,
                meta: { extensions: extensions, ...colProps.meta },
                ...colProps
            }
            return column
        }
        
        const column: ColumnDef<TableData> = {
            header: key.replaceAll(/_/g, " ").toUpperCase(), // Format column header text
            accessorKey: key,
            meta: { extensions: extensions }
        }
        return column
    })
}

interface MakeTableConfig<T> {
    initData: T[]
    extensions?: MAFColumnExtensions
    columnProps?: {id: string, props: Partial<ColumnDef<T>>}[]
}

// Custom hook function to generate table data and columns (properties for Table2 component)
export function useMakeTable<T extends Record<string, any>>({initData, extensions, columnProps}: MakeTableConfig<T>) {
    if (initData.length === 0) { return { data: [], columns: [] } }
    else {
        // create "id" property for each data record
        const data = useMakeData(initData)
        const columns = useMemo(() => { return useMakeColumns(initData, extensions, columnProps)}, [])
        return { data, columns }
    }
}