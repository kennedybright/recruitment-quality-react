// Formatting for the Monitored Call Alert (MCA) Report

import { Page, View, Text, Document } from '@react-pdf/renderer'
import { docStyles, headerStyles, reportStyles, tableStyles } from './stylesheet'
import { Questions } from './legend'
import { isEmpty } from '../../../lib/utils/helpers'
import { formatErrorAreas, getPrintDate } from '../../../lib/utils/reports/formatReport'
import { QueryClientProvider } from 'react-query'
import { queryClient } from '../../../maf-api'

export const ReportMCA = ({data, ri, date}) => {
    // MCA Report Header
    const MCAHeader = ({reportType}) => (
        <View style={headerStyles.container} fixed>
            <View style={headerStyles.title}>
                <Text style={headerStyles.name}>Monitored Call Alert - {reportType}</Text>
            </View>
            <View style={headerStyles.dateSite}>
                <Text>Print Date: {getPrintDate()}</Text>
            </View>
        </View>
    )
  
    // MCA Individual Call Details Table
    const MCACall = ({data}) => (
        <View wrap={false} style={[tableStyles.container, {rowGap: 10}]}>
            <View style={tableStyles.table}>
                {/* MCA Details */}
                <View style={[tableStyles.errorRow, tableStyles.topBorder]}> 
                    <View style={tableStyles.mcaRow}>
                        <Text style={[tableStyles.textField, {fontFamily: "Helvetica-Bold"}]}>MCA Category:</Text>
                        <Text style={[tableStyles.textField, tableStyles.mcaCategory, {textDecorationStyle: "solid"}]}>{data.mca_category}</Text>
                    </View>
                </View>
        
                {/* MCA Summary of Observation Notes */}
                <View style={[tableStyles.errorRow, {rowGap: 2}]}>
                    <Text style={[tableStyles.textField, {fontFamily: "Helvetica-Bold"}]}>MCA Summary of Observation:{" "}</Text>
                    <Text style={tableStyles.textField}>{data.mca_summary_observation}</Text>
                </View>
            </View>
            <View style={tableStyles.table}>
                {/* Call Details Header */}
                <View style={[tableStyles.headerRow, tableStyles.topBorder]}>
                    <Text style={[tableStyles.cell, tableStyles.riID]}>RI ID</Text>
                    <Text style={[tableStyles.cell, tableStyles.recordDate]}>Record Date</Text>
                    <Text style={[tableStyles.cell, tableStyles.recordNumber]}>Record Number</Text>
                    <Text style={[tableStyles.cell, tableStyles.frameCode]}>Frame Code</Text>
                    <Text style={[tableStyles.cell, tableStyles.callType]}>Call Type</Text>
                    <Text style={[tableStyles.cell, tableStyles.recordShift]}>Record Shift</Text>
                    <Text style={[tableStyles.cell, tableStyles.sampleID]}>Sample ID</Text>
                    <Text style={[tableStyles.cell, tableStyles.callDirection]}>Call Direction</Text>
                    <Text style={[tableStyles.cell, tableStyles.disposition]}>Disposition</Text>
                </View>
    
                {/* Record Row */}
                <View style={tableStyles.row}>
                    <Text style={[tableStyles.cell, tableStyles.riID]}>{data.ri_id}</Text>
                    <Text style={[tableStyles.cell, tableStyles.recordDate]}>{data.record_date}</Text>
                    <Text style={[tableStyles.cell, tableStyles.recordNumber]}>{data.record_number}</Text>
                    <Text style={[tableStyles.cell, tableStyles.frameCode]}>{data.frame_code_id}</Text>
                    <Text style={[tableStyles.cell, tableStyles.callType]}>{data.call_type_id}</Text>
                    <Text style={[tableStyles.cell, tableStyles.recordShift]}>{data.ri_shift}</Text>
                    <Text style={[tableStyles.cell, tableStyles.sampleID]}>{data.sample_id}</Text>
                    <Text style={[tableStyles.cell, tableStyles.callDirection]}>{data.call_direction}</Text>
                    <Text style={[tableStyles.cell, tableStyles.disposition]}>{data.disposition}</Text>
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
  
    // MCA Report
    const MCAMonitoring = ({mcaRecord, mcaPriors}) => (
        <View style={reportStyles.reportContainer}>
            <View>
                <Text style={[reportStyles.header, {textTransform: "uppercase"}]}>MCA Report Details:</Text>
                <MCACall data={mcaRecord} />
                <Text style={[reportStyles.header, {marginTop: 15}]}>Current & Prior MCAs:</Text>
                {!isEmpty(mcaPriors) && <CurrentPriorMCA data={mcaPriors} />}
            </View>
        </View>
    )
  
    // MCA Table for Current & Prior MCAs
    const CurrentPriorMCA = ({data}) => (
        <View style={tableStyles.mcaTable}>
            {/* MCA Dates Header */}
            <View style={[tableStyles.headerRow, tableStyles.topBorder]}>
                <Text style={[tableStyles.cell, tableStyles.dateCall]}>Date of Call</Text>
                <Text style={[tableStyles.cell, tableStyles.mcaPrior]}>MCA Category</Text>
            </View>

            {/* MCA Record Row */}
            <View>
                {data.map((mca) => (
                    <View style={tableStyles.row}>
                        <Text style={[tableStyles.cell, tableStyles.dateCall]}>{mca.record_date}</Text>
                        <Text style={[tableStyles.cell, tableStyles.mcaPrior]}>{mca.mca_category}</Text>
                    </View>
                ))}
            </View>
        </View>
    )

    return (
        <QueryClientProvider client={queryClient}>
            <Document title={`MCA Report - ${date} - ${ri}`}>
                <Page orientation="landscape" size="A4" style={docStyles.page}>
                    <MCAHeader reportType={data.report.audio_smp} />
                    <View style={docStyles.container}>
                        <View style={docStyles.leftColumn}>
                            <Questions />
                        </View>
                        <MCAMonitoring mcaRecord={data.report} mcaPriors={data.mcaPriors} />
                    </View>
                </Page>
            </Document>
        </QueryClientProvider>
    )
}