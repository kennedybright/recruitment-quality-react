// Formatting for the Call Monitoring Report

import { Page, View, Text, Document } from '@react-pdf/renderer'
import { headerStyles, tableStyles, reportStyles, docStyles } from './stylesheet'
import { CallTypes, FrameCodes, Questions } from './legend'
import { isEmpty } from '../../../lib/utils/helpers'
import { formatErrorAreas, getAccuracyColor, getPrintDate } from '../../../lib/utils/reports/formatReport'
import { QueryClientProvider } from 'react-query'
import { queryClient } from '../../../maf-api'

export const ReportCMR = ({data, ri, date}) => {
    // CMR Report Header
    const CMRHeader = ({ site }) => (
        <View style={headerStyles.container} fixed>
            <View style={headerStyles.title}>
                <Text style={headerStyles.name}>
                    {"Daily Audio/SMP\nQA Monitoring Report"}
                </Text>
            </View>
            <View style={headerStyles.dateSite}>
                <Text>Print Date: {getPrintDate()}</Text>
                <Text>Calling Site: {site}</Text>
            </View>
        </View>
    )
    
    // CMR Report Monitoring Records
    const CMRMonitoring = ({ riID, recordDate, data }) => (
        <View style={reportStyles.reportContainer}>
            {/* Monitoring Records Header */}
            <View>
                <Text style={[reportStyles.header, {textTransform: "uppercase"}]}>Monitoring Report Details:</Text>
                <View style={reportStyles.headerContainer}>
                    <View style={reportStyles.leftColumn}>
                        <Text>RI ID: {riID}</Text>
                    </View>
                    <View style={reportStyles.rightColumn}>
                        <Text>Record Date: {recordDate}</Text>
                    </View>
                </View>
            </View>
        
            {/* Monitoring Individual Record Tables */}
            <View>
                {data.map((record) => (
                    <CMRCall data={record} />
                ))}
            </View>
        </View>
    )
    
    // CMR Individual Call Details Table
    const CMRCall = ({ data }) => (
        <View wrap={false} style={tableStyles.container}>
            <View style={tableStyles.table}>
                {/* Table Column Header */}
                <View style={[tableStyles.headerRow, tableStyles.topBorder]}>
                    <Text style={[tableStyles.cell, tableStyles.recordNumber]}>Record Number</Text>
                    <Text style={[tableStyles.cell, tableStyles.recordType]}>Record Type</Text>
                    <Text style={[tableStyles.cell, tableStyles.frameCode]}>Frame Code</Text>
                    <Text style={[tableStyles.cell, tableStyles.callType]}>Call Type</Text>
                    <Text style={[tableStyles.cell, tableStyles.recordShift]}>Record Shift</Text>
                    <Text style={[tableStyles.cell, tableStyles.sampleID]}>Sample ID</Text>
                    <Text style={[tableStyles.cell, tableStyles.callDirection]}>{"Call\nDirection"}</Text>
                    <Text style={[tableStyles.cell, tableStyles.disposition]}>Disposition</Text>
                    <Text style={[tableStyles.cell, tableStyles.opportunities]}>Opportunities</Text>
                    <Text style={[tableStyles.cell, tableStyles.deviations]}>Deviations</Text>
                    <Text style={[tableStyles.cell, tableStyles.accuracy]}>Accuracy</Text>
                </View>
        
                {/* Record Row */}
                <View style={tableStyles.row}>
                    <Text style={[tableStyles.cell, tableStyles.recordNumber]}>{data.record_number}</Text>
                    <Text style={[tableStyles.cell, tableStyles.recordType]}>{data.audio_smp}</Text>
                    <Text style={[tableStyles.cell, tableStyles.frameCode]}>{data.frame_code_id}</Text>
                    <Text style={[tableStyles.cell, tableStyles.callType]}>{data.call_type_id}</Text>
                    <Text style={[tableStyles.cell, tableStyles.recordShift]}>{data.ri_shift}</Text>
                    <Text style={[tableStyles.cell, tableStyles.sampleID]}>{data.sample_id}</Text>
                    <Text style={[tableStyles.cell, tableStyles.callDirection]}>{data.call_direction}</Text>
                    <Text style={[tableStyles.cell, tableStyles.disposition]}>{data.disposition}</Text>
                    <Text style={[tableStyles.cell, tableStyles.opportunities]}>{data.total_opportunities}</Text>
                    <Text style={[tableStyles.cell, tableStyles.deviations]}>{data.total_deviations}</Text>
                    <Text style={[tableStyles.cell, tableStyles.accuracy, { backgroundColor: getAccuracyColor(data.final_score) }]}>
                        {data.final_score}%
                    </Text>
                </View>
        
                {/* Observed Differences */}
                <View style={tableStyles.errorRow}>
                    <View style={tableStyles.errorAreaRow}>
                        <Text style={tableStyles.textField}>A difference was observed in the following areas:{" "}</Text>
                        <Text style={[tableStyles.textField, tableStyles.errorArea]}>{formatErrorAreas(data.obsv_diffs)}</Text>
                    </View>
                </View>
        
                {/* Call Notes */}
                <View style={[tableStyles.errorRow, {rowGap: 2}]}>
                    <Text style={tableStyles.textField}>Call Notes:{" "}</Text>
                    <Text style={tableStyles.commentText}>{data.call_notes}</Text>
                </View>
            </View>
        </View>
    )
    
    // CMR Report Monitoring Session Summary {/*<View><View>*/}
    const CMRMonitoringSummary = ({ data }) => (
        <View style={reportStyles.summaryContainer}>
            {/* Monitoring Session Summary Header */}
            <View style={reportStyles.summaryHeader}>
                <View style={reportStyles.summaryHeaderTextArea}>
                    <Text style={reportStyles.summaryHeaderTitle}>{"Monitoring Summary\nfor this Session"}</Text>
                    <Text style={reportStyles.summaryHeaderSubtitle}>
                        (includes non-published calls such as answering machines, other
                        non live calls and MCAs)
                    </Text>
                </View>
                <View style={reportStyles.summaryTable}>
                    <View style={reportStyles.summaryRow}>
                        <Text style={reportStyles.summaryHeaderCell}>Total # of Calls Monitored</Text>
                        <Text style={reportStyles.summaryCell}>{data.total_calls}</Text>
                    </View>
                    <View style={reportStyles.summaryRow}>
                        <Text style={reportStyles.summaryHeaderCell}>Accuracy</Text>
                        <Text style={[reportStyles.summaryCell, { backgroundColor: getAccuracyColor(data.total_accuracy) }]}>
                            {data.total_accuracy}%
                        </Text>
                    </View>
                </View>
            </View>
    
            {/* MCA Details Summary */}
            <View>
                {/* MCA Monitoring Summary Header */}
                <View style={{marginTop: 30}}>
                    <Text style={[reportStyles.header, {textTransform: "uppercase", textAlign:'center'}]}>MCA Dates with the Last 6 Months:</Text>
                </View>
                
                {/* MCA Details Table */}   
                <View style={[tableStyles.table, {marginTop: 5}]}>
                    {/* Table Column Header */}
                    <View style={[tableStyles.headerRow, tableStyles.topBorder, { fontFamily: "Helvetica-Bold", fontSize: 12 }]}>
                        <Text style={reportStyles.cell}>Improper Intro</Text>
                        <Text style={reportStyles.cell}>Inaccurate Data</Text>
                        <Text style={reportStyles.cell}>Leading Bias</Text>
                        <Text style={reportStyles.cell}>Verbatim Break</Text>
                        <Text style={reportStyles.cell}>Mandatory Text</Text>
                        <Text style={reportStyles.cell}>{"Incorrect\nDisposition"}</Text>
                        <Text style={reportStyles.cell}>Delayed Coding</Text>
                        <Text style={reportStyles.cell}>Address</Text>
                        <Text style={reportStyles.cell}>Persuading</Text>
                    </View>
        
                    {/* Table Records */}
                    <View style={tableStyles.row}>
                        {Object.values(data.mca_dates)?.map((col) => (
                            <MCADateCell dates={col} />
                        ))}
                    </View>
                </View>
            </View>
        </View>
    )
        
    // CMR MCA Date Records
    const MCADateCell = ({ dates }) => (
        <View style={reportStyles.cell}>
            {!isEmpty(dates) && dates.map((date) => (
                <Text style={reportStyles.mcaCell}>{date}</Text>
            ))}
        </View>
    )
        
    // CMR Report Footer
    const CMRFooter = () => (
        <View style={docStyles.footer} fixed>
            <View style={docStyles.signature}>
                <Text>RI Signature: ___________________ Date: _______________</Text>
            </View>
            <View style={docStyles.signature}>
                <Text>Initials: _________ Date: _______________</Text>
            </View>
        </View>
    )

    return (
        <QueryClientProvider client={queryClient}>
            <Document title={`Call Monitoring Report - ${date} - ${ri}`}>
                <Page orientation="landscape" size="A4" style={docStyles.page}>
                    <CMRHeader site={data.report[0].site_name_id} />
                    {/* CMR Monitoring Session Breakdown */}
                    <View style={docStyles.container}>
                        <View style={docStyles.leftColumn}>
                            <Questions />
                            <CallTypes />
                            <FrameCodes />
                        </View>
                        <CMRMonitoring riID={ri} recordDate={date} data={data.report} />
                    </View>

                    {/* CMR Monitoring Session Summary */}
                    <View break>
                        <CMRMonitoringSummary data={data.summary} />
                    </View>
                    <CMRFooter />
                </Page>
            </Document>
        </QueryClientProvider>
    )
}
