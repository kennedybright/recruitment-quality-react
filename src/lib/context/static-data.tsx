import { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { fetchAppData, fetchAuditTracking, fetchCalltypes, fetchCalltypeSkipLogic, fetchFormFields, fetchFramecodes, fetchMcaCategories, fetchRIData, fetchSitenames } from "../maf-api/api-form-data"
import { FormField } from "../utils/qa-forms"
import { InputItemOption } from "@nielsen-media/maf-fc-select"

export interface FieldCatg extends InputItemOption {
    label: string
    value: string | number
    siteNameID?: string // RI-specific property
}

export interface FieldLogic {
    field: string
    calltype: string
    audioSMP: string
    disabled: boolean
}

export interface DataContextType {
    audioFormFields: FormField[]
    tamFormFields: FormField[]
    appList: FieldCatg[]
    auditTrackingList: FieldCatg[]
    riList: FieldCatg[]
    riShiftList: FieldCatg[]
    calltypeList: FieldCatg[]
    framecodeList: FieldCatg[]
    sitenameList: FieldCatg[]
    mcaCategoryList: FieldCatg[]
    audioSMPScoring: FieldCatg[]
    callDirectionList: FieldCatg[]
    dispositionList: FieldCatg[]
    skipLogicList: FieldLogic[]
    dropdowns: Record<string, FieldCatg[]> // Store ALL data dropdown lists
    formFields: Record<number, FormField[]> // Store ALL form field lists
}

const StaticDataContext = createContext<DataContextType>(null)

// ------------------------------------------------------------------------------- //
// Main Data Context Provider for static data

export const DataProvider: FC = ({ children }:{ children:ReactNode }) => {
    const [appList, setAppList] = useState<FieldCatg[]>([])
    const [audioFormFields, setAudioFormFields] = useState<FormField[]>([])
    const [tamFormFields, setTamFormFields] = useState<FormField[]>([])
    const [auditTrackingList, setAuditTrackingList] = useState<FieldCatg[]>([])
    const [riList, setRIList] = useState<FieldCatg[]>([])
    const [riShiftList, setRIShiftList] = useState<FieldCatg[]>([])
    const [calltypeList, setCalltypeList] = useState<FieldCatg[]>([])
    const [framecodeList, setFramecodeList] = useState<FieldCatg[]>([])
    const [sitenameList, setSitenameList] = useState<FieldCatg[]>([])
    const [mcaCategoryList, setMcaCategoryList] = useState<FieldCatg[]>([])
    const [dispositionList, setDispositionList] = useState<FieldCatg[]>([])
    const [audioSMPScoringList, setAudioSMPScoringList] = useState<FieldCatg[]>([])
    const [callDirectionList, setCallDirectionList] = useState<FieldCatg[]>([])
    const [skipLogicList, setSkipLogicList] = useState<FieldLogic[]>([])
    
    useEffect(() => { // Fetch all static data using API
        const fetchApps = async() => { // Fetch QA Apps
            try {
                const data = await fetchAppData()
                setAppList(data)
            } catch(err) {
                console.error("Error fetching all Audit tracking reasons: ", err)
            }
        }

        const fetchFields = async() => { // Fetch default Form Fields
            try {
                const audioFields = await fetchFormFields(1001)
                const tamFields = await fetchFormFields(1002)

                if (audioFields) {
                    const sortedFields = audioFields.sort((a, b) => a.id - b.id)
                    const updatedFields = sortedFields.map((field) => {
                        if (field.value === '1') return { ...field, value: 1}  // replace default value "1" string with 1 number
                        if (field.value === 'false')  return { ...field, value: false} // replace default value "false" string with false boolean
                        return field
                    })
                    setAudioFormFields(updatedFields)
                }

                if (tamFields) {
                    const sortedFields = tamFields.sort((a, b) => a.id - b.id)
                    const updatedFields = sortedFields.map((field) => {
                        if (field.value === '1') return { ...field, value: 1}  // replace default value "1" string with 1 number
                        if (field.value === 'false')  return { ...field, value: false} // replace default value "false" string with false boolean
                        return field
                    })
                    setTamFormFields(updatedFields)
                }

            } catch(err) { console.error("Error fetching form fields: ", err) }
        }
        
        const fetchAuditTracks = async() => { // Fetch RIs
            try {
                const data = await fetchAuditTracking()
                setAuditTrackingList(data)
            } catch(err) {
                console.error("Error fetching all Audit tracking reasons: ", err)
            }
        }
    
        const fetchRIs = async() => { // Fetch RIs
            try {
                const data = await fetchRIData()
                setRIList(data)
            } catch(err) {
                console.error("Error fetching all RIs: ", err)
            }
        }
    
        const fetchCalltypeData = async() => { // Fetch Call types
            try {
                const data = await fetchCalltypes()
                const calltypes = data.map((ct) => { return { label: ct.label, value: ct.label } })
                setCalltypeList(calltypes)
            } catch(err) {
                console.error("Error fetching all Call types: ", err)
            }
        }
    
        const fetchFramecodeData = async() => { // Fetch Framecodes
            try {
                const data = await fetchFramecodes()
                const framecodes = data.map((fc) => { return { label: fc.label, value: fc.label } })
                setFramecodeList(framecodes)
            } catch(err) {
                console.error("Error fetching all Frame codes: ", err)
            }
        }
    
        const fetchSitenameData = async() => { // Fetch Sitenames
            try {
                const data = await fetchSitenames()
                const sitenames = data.map((sn) => { return { label: sn.label, value: sn.label } })
                setSitenameList(sitenames)
            } catch(err) {
                console.error("Error fetching all Frame codes: ", err)
            }
        }
    
        const fetchMcaData = async() => { // Fetch MCA Categories
            try {
                const data = await fetchMcaCategories()
                data.unshift({label: " ", value: null})
                setMcaCategoryList(data)
            } catch(err) {
                console.error("Error fetching current user's metadata: ", err)
            }
        }
    
        const fetchSkipLogic = async() => { // Fetch skip logic for Calltypes - Fields - Form type
            try {
                const data = await fetchCalltypeSkipLogic()
                setSkipLogicList(data)
            } catch(err) {
                console.error("Error fetching current user's metadata: ", err)
            }
        }
        
        // Get all fetched data
        fetchApps()
        fetchFields()
        fetchAuditTracks()
        fetchRIs()
        fetchCalltypeData()
        fetchFramecodeData()
        fetchSitenameData() 
        fetchMcaData()
        fetchSkipLogic()

        // Initialize all other data
        setRIShiftList([ { label: 'Day', value: 'Day' }, { label: 'Night', value: 'Night' } ])
        setAudioSMPScoringList([ {label: "-1", value: -1}, {label: "0", value: 0}, {label: "1", value: 1} ])
        setDispositionList([ {label: "Correct", value: "CORRECT"}, {label: "Incorrect", value: "INCORRECT"} ])
        setCallDirectionList([ { label: 'Inbound', value: 'IN'}, { label: 'Outbound', value: 'OUT'} ])
    }, [])

    const dropdowns = useMemo(() => ({
        app_id: appList,
        audit_tracking: auditTrackingList,
        ri_id: riList,
        ri_shift: riShiftList,
        call_type_id: calltypeList,
        frame_code_id: framecodeList,
        site_name_id: sitenameList,
        call_direction: callDirectionList,
        mca_category: mcaCategoryList,
        disposition: dispositionList
    }), [appList, auditTrackingList, riList, riShiftList, calltypeList, framecodeList, sitenameList, callDirectionList, mcaCategoryList, dispositionList])

    const formFields = useMemo(() => ({
        1001: audioFormFields, // Audio/SMP app ID for Audio/SMP form fields
        1002: tamFormFields, // TAM app ID for TAM form fields
    }), [audioFormFields, tamFormFields])

    const skipLogic = useMemo(() => (skipLogicList), [skipLogicList])
    const audioSMPScoring = useMemo(() => (audioSMPScoringList), [audioSMPScoringList])

    return (
        <StaticDataContext.Provider 
            value={{
                audioFormFields,
                tamFormFields,
                appList,
                auditTrackingList,
                riList,
                riShiftList,
                calltypeList,
                framecodeList,
                sitenameList,
                callDirectionList,
                mcaCategoryList,
                dispositionList,
                audioSMPScoring: audioSMPScoring,
                skipLogicList: skipLogic,
                dropdowns: dropdowns,
                formFields: formFields,
            }}
        >
            {children}
        </StaticDataContext.Provider>
    )
}
    
// Custom hook to use the data context
export const useDataContext = () => {
    const context = useContext(StaticDataContext)
    if (!context) throw new Error("useDataContext must be used within a DataProvider")
    return context
}
