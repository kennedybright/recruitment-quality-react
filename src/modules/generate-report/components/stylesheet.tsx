import { StyleSheet } from '@react-pdf/renderer'

export const headerStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderBottomWidth: 2,
        borderBottomColor: "#112131",
        borderBottomStyle: "solid",
        alignItems: "stretch",
        marginBottom: 10,
    },
    reportHeader: {
        flexDirection: "row",
        flexGrow: 9,
        textTransform: "uppercase",
    },
    title: {
        flexDirection: "column",
        flexGrow: 9,
        textTransform: "uppercase",
    },
    name: {
        fontSize: 18,
        fontFamily: "Helvetica-Bold",
        marginBottom: 5,
    },
    dateSite: {
        fontFamily: "Helvetica",
        flexDirection: "column",
        fontSize: 12,
        color: "black",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        marginBottom: 5,
    }
})
  
export const legendStyles = StyleSheet.create({
    section: {
        marginBottom: 10,
    },
    sectionHeader: {
        fontFamily: "Helvetica-Bold",
        fontSize: 11,
        marginBottom: 4,
        textTransform: "uppercase",
    },
    columnWrapper: {
        flexDirection: "row",
        gap: 25,
        alignItems: "flex-start",
        paddingRight: 30,
        marginTop: 10,
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: 1,
        justifyContent: "flex-start",
        fontSize: 7,
    },
    label: {
        fontFamily: "Helvetica-Bold",
        marginBottom: 2,
        width: 38,
        textTransform: "uppercase",
    },
    value: {
        flex: 1,
        fontFamily: "Helvetica",
        marginBottom: 2,
    }
})
  
export const reportStyles = StyleSheet.create({
    reportContainer: {
        flex: 1,
        paddingTop: 10,
        paddingLeft: 15,
    },
    header: {
        fontFamily: "Helvetica-Bold",
        fontSize: 11,
        marginBottom: 4,
    },
    summaryContainer: {
        minHeight: "100%",
        paddingTop: 10,
        paddingVertical: 30,
    },
    summaryHeader: {
        flexDirection: "row",
        justifyContent: "center",
        columnGap: 25,
        height: 120,
    },
    summaryHeaderTextArea: {
        width: 280,
        flexDirection: "column",
        justifyItems: "right",
        textAlign: "right",
        rowGap: 6,
        fontFamily: "Helvetica",
    },
    summaryHeaderTitle: {
        fontFamily: "Helvetica-Bold",
        fontSize: 20,
    },
    summaryHeaderSubtitle: {
        fontFamily: "Helvetica-Oblique",
        fontSize: 14,
    },
    summaryTable: {
        border: "1px solid black",
        fontFamily: "Helvetica",
        fontSize: 20,
        height: "100%",
        alignSelf: "center",
    },
    summaryRow: {
        width: 300,
        flexDirection: "row",
        borderBottom: "0.5px solid black",
        height: "50%",
    },
    summaryHeaderCell: {
        backgroundColor: "#f0f0f0",
        fontFamily: "Helvetica-Bold",
        width: "50%",
        padding: "4 5",
        borderRight: "1px solid black",
    },
    summaryCell: {
        padding: "4 5",
        textAlign: "center",
        width: "50%",
        fontFamily: "Helvetica-Bold",
    },
    headerContainer: {
        flexDirection: "row",
        marginBottom: 10,
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
    },
    leftColumn: {
        flexDirection: "column",
        flexGrow: 1,
    },
    rightColumn: {
        flexDirection: "column",
        flexGrow: 1,
        alignItems: "flex-end",
        justifySelf: "flex-end",
    },
    cell: {
        padding: "3 5",
        fontSize: 8,
        borderLeft: "0.5px solid black",
        borderRight: "0.5px solid black",
        flex: 1,
        textAlign: "center",
    },
    mcaCell: {
        fontSize: 10,
        maxLines: 1,
        flexDirection: "column",
        color: "#E3071D",
        marginVertical: 1,
    }
})
  
export const tableStyles = StyleSheet.create({
    container: {
        flexDirection: "column",
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 8,
    },
    table: {
        width: "100%",
        borderLeft: "0.5px solid black",
        borderRight: "0.5px solid black",
        fontFamily: "Helvetica",
    },
    mcaTable: {
        width: 200,
        borderLeft: "0.5px solid black",
        borderRight: "0.5px solid black",
    },
    row: {
        flexDirection: "row",
        borderBottom: "1px solid black",
        minHeight: 5,
    },
    headerRow: {
        backgroundColor: "#f0f0f0",
        flexDirection: "row",
        borderBottom: "1px solid black",
        minHeight: 20,
    },
    cell: {
        padding: "3 5",
        fontSize: 8,
        borderLeft: "0.5px solid black",
        borderRight: "0.5px solid black",
        display: "flex",
        alignItems: "center",
    },
    errorRow: {
        backgroundColor: "#fff",
        padding: "3 5",
        fontSize: 8,
        borderBottom: "1px solid black",
        borderLeft: "0.5px solid black",
        borderRight: "0.5px solid black",
    },
    riID: { width: "8%" },
    recordDate: { width: "12%" },
    recordNumber: { width: "13%" },
    recordType: { width: "9%" },
    frameCode: { width: "12%" },
    callType: { width: "10%" },
    recordShift: { width: "8%" },
    sampleID: { width: "13%" },
    disposition: { width: "12%" },
    callDirection: { width: "10%" },
    opportunities: { width: "14%", textAlign: "center" },
    deviations: { width: "13%", textAlign: "center" },
    accuracy: { width: "12%", textAlign: "center", fontFamily: "Helvetica-Bold" },
    dateCall: { width: "35%" },
    mcaPrior: { flexGrow: 1 },
    topBorder: {
        borderTop: "1px solid black",
    },
    commentText: {
        fontSize: 8,
        lineHeight: 1.4,
    },
    textField: {
        fontSize: 10,
    },
    errorAreaRow: {
        flexDirection: "row",
    },
    errorArea: {
        fontFamily: "Helvetica-Bold"
    },
    mcaRow: {
        flexDirection: "row",
    },
    mcaCategory: {
        fontFamily: "Helvetica-Bold",
        paddingLeft: 5,
        textTransform: "uppercase",
    }
})
  
export const docStyles = StyleSheet.create({
    page: {
        padding: 30,
    },
    sections: {
        flexDirection: "column",
    },
    container: {
        flex: 1,
        flexDirection: "row",
    },
    leftColumn: {
        flexDirection: "column",
        width: 105,
        paddingTop: 10,
        paddingRight: 10,
        borderRightWidth: 1,
        borderRightColor: "#112131",
        borderRightStyle: "solid",
    },
    footer: {
        flexDirection: "row",
        fontSize: 10,
        textAlign: "center",
        marginTop: 10,
        paddingTop: 5,
        justifyContent: "center",
    },
    signature: {
        paddingHorizontal: 10,
    }
})