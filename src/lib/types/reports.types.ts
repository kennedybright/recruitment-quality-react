import { FieldCatg } from "./forms.types"

export type CMRSummary = {
    total_calls: number
    total_accuracy: number
    mca_dates: CMRSummaryDates
}

export type CMRSummaryDates = {
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

export type ReportCMR = {
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

export type ReportMCA = {
    audio_smp: string
    record_number: number
	qr_id: string
	ri_id: string
	sample_id: number
    record_date: string
    record_time: string
    frame_code_id: string
    call_type_id: string
    call_direction: string
    ri_shift: string
    disposition: string
    mca_category: string
    mca_summary_observation: string | null
    call_notes: string | null
    site_name_id: string
}

export type ReportLCM = {
    ri_id: string
    total_calls_monitored: number
	total_live_calls: number
	last_date_monitored: string
	last_qr: string
    last_study: string
    date_diff: number
}

export type CMRReportData = { // Full CMR Report data
    report: ReportCMR[]
    summary?: CMRSummary | {}
}

export type MCAReportData = { // Full MCA Report data
    report: {}
    mcaPriors?: ReportMCA[]
}

export type LegendData = {
    callTypes: FieldCatg[]
    frameCodes: FieldCatg[]
    questionFields: string[]
}