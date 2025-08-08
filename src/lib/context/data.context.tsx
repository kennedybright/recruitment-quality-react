import { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { Apps, FieldCatg, FieldLogic, FormFieldMap, RI } from '../types/forms.types'
import { useApps, useAuditTracking, useCalltypes, useFormFieldsMap, useFramecodes, useMCA, 
    useRIList, useSitenames, useSkipLogicAudio } from '../maf-api/hooks/qa.hooks'
import { SystemUser } from '../types/global.types'
import { AUDIOSMPSCORING, CALLDIRECTION, DISPOSITION, RISHIFT } from '../../modules/qaforms/base/constants'
import { isEmpty } from '../utils/helpers'

export interface DataContextType {
    dataLoaded: boolean
    currentUser: SystemUser
    apps: Apps
    riList: RI[]
    formFields: FormFieldMap // Store ALL form field lists
    audioSMPScoring: FieldCatg[]
    skipLogicAudio: FieldLogic[]
    dropdowns: Record<string, FieldCatg[]> // Store ALL data dropdown lists
}

const StaticDataContext = createContext<DataContextType>(null)

// ------------------------------------------------------------------------------- //
// Main Data Context Provider for static data

type DataProviderProps = {
    user: SystemUser
    appID?: 'all' | number[] | number
    children: ReactNode
}

export const DataProvider: FC<DataProviderProps> = ({ user, appID, children }) => {
    const [dataLoaded, setDataLoaded] = useState<boolean>(false)
    
    // Get all fetched data
    const { data: apps, isFetched: appsFetched } = useApps()
    const appsToLoad: number[] = useMemo(() => {
        if (!appsFetched || !apps) return []
        if (appID === 'all') return Object.keys(apps).map(app => Number(app))
        return typeof appID === 'number' ? [appID] : appID
    }, [appID, appsFetched, apps])

    const formFieldsQueries = useFormFieldsMap(appsToLoad)
    const formFieldsMap: FormFieldMap = useMemo(() => {
        if (!formFieldsQueries?.length) return null

        const results = {}
        formFieldsQueries.forEach((q, ndx) => {
            if (q.isLoading || !q.data) results[appsToLoad[ndx]] = null
            if (q.isFetched && !q.isError) results[appsToLoad[ndx]] = q.data
        })
        return results
    }, [appsToLoad, formFieldsQueries])

    const { data: riList } = useRIList()
    const { data: auditTrackingList } = useAuditTracking()
    const { data: calltypeList } = useCalltypes()
    const { data: framecodeList } = useFramecodes()
    const { data: sitenameList } = useSitenames()
    const { data: mcaCategoryList } = useMCA()

    const { data: skipLogicAudio } = (typeof appID === 'number' && appID === 1001) 
        ? useSkipLogicAudio() 
        : { data: [] }

    // Create dropdown options registry by field_name
    const dropdowns = useMemo(() => ({
        audit_tracking: auditTrackingList,
        ri_id: riList?.map((ri) => ({
            label: ri?.id,
            value: ri?.id,
            siteNameID: ri?.siteNameID,
            lob: ri?.lob
        }))?.filter(ri => ri?.label !== null) as FieldCatg[], // remove null RI IDs
        ri_shift: RISHIFT,
        call_type_id: calltypeList,
        frame_code_id: framecodeList,
        site_name_id: sitenameList,
        call_direction: CALLDIRECTION,
        mca_category: mcaCategoryList,
        disposition: DISPOSITION
    }), [
        auditTrackingList, 
        riList, 
        calltypeList, 
        framecodeList, 
        sitenameList, 
        mcaCategoryList
    ])

    useEffect(() => { // check if all static data has been loaded
        if (!appsToLoad?.length || !formFieldsMap) setDataLoaded(false)

        const allDropdownsHaveData = Object.values(dropdowns).every((list) => !isEmpty(list))
        const allAppsHaveFieldData = appsToLoad.every((appID) => Object.prototype.hasOwnProperty.call(formFieldsMap, appID))

        if (allDropdownsHaveData && allAppsHaveFieldData) {
            if (appsToLoad.includes(1001) && skipLogicAudio.length === 0) setDataLoaded(false)
            setDataLoaded(true)
        } else setDataLoaded(false)
    }, [appsToLoad, formFieldsMap, dropdowns, skipLogicAudio])

    return (
        <StaticDataContext.Provider 
            value={{
                dataLoaded,
                currentUser: user,
                apps,
                riList,
                audioSMPScoring: AUDIOSMPSCORING,
                skipLogicAudio,
                dropdowns,
                formFields: formFieldsMap,
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

