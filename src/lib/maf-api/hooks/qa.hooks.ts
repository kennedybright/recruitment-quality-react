import { useQueries, useQuery, UseQueryResult } from "react-query"
import qaKeys from "../query-keys/qa.keys"
import { fetchFormFields, fetchAllRI, fetchAuditTracking, fetchCalltypeSkipLogic, 
    fetchCalltypes, fetchFramecodes, fetchMcaCategories, fetchSitenames, fetchApps } from "../services/qa.service"
import { FormField, FieldLogic, Apps, FieldCatg, RI } from "../../../lib/types/forms.types"
import { AxiosError } from "axios"
import { formatFields } from "../../../lib/utils/qa/buildQA"
import { getAlphaNumType } from "../../../lib/utils/helpers"

////////////////////////////////////////////////////////////////////////////////////////////////
// GET Hooks: 

export const useApps = () => {
    return useQuery<Apps, AxiosError>({
        queryKey: qaKeys.apps(),
        queryFn: () => fetchApps(),
        staleTime: Infinity,
        cacheTime: 1000 * 60 * 60, // 1 hour in memory
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false
    })
}

export const useFormFieldsMap = (apps: number[]) => {
    return useQueries<UseQueryResult<FormField[], AxiosError>[]>(
        apps.map((appID) => ({
            queryKey: qaKeys.formFields(appID),
            queryFn: () => fetchFormFields(appID).then(fields => formatFields(fields) as FormField[]),
            enabled: !!apps && !!appID,
            staleTime: Infinity,
            cacheTime: Infinity
        }))
    )
}

export const useFormFields = (appID: number, fieldType?: string) => {
    return useQuery<FormField[], AxiosError>({
        queryKey: qaKeys.formFields(appID, fieldType),
        queryFn: () => fetchFormFields(appID, fieldType).then(fields => formatFields(fields)),
        enabled: !!appID || !!fieldType,
        staleTime: Infinity,
        cacheTime: Infinity
    })
}

export const useRIList = () => {
    return useQuery<RI[], AxiosError>({
        queryKey: qaKeys.riList(),
        queryFn: () => fetchAllRI().then((riList) => 
            riList?.sort((a, b) => {
                const typeA = getAlphaNumType(a.id)
                const typeB = getAlphaNumType(b.id)

                if (typeA !== typeB) return typeA - typeB
                return a.id?.localeCompare(b.id, undefined, {numeric: true})
            })
        ),
        staleTime: 1000 * 60 * 10, // 10 minutes
        cacheTime: 1000 * 60 * 120, // 2 hours
    })
}

export const useAuditTracking = () => {
    return useQuery<FieldCatg[], AxiosError>({
        queryKey: qaKeys.auditTracking(),
        queryFn: () => fetchAuditTracking(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        cacheTime: 1000 * 60 * 120, // 2 hours
    })
}

export const useCalltypes = () => {
    return useQuery<FieldCatg[], AxiosError>({
        queryKey: qaKeys.calltypes(),
        queryFn: () => fetchCalltypes(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        cacheTime: 1000 * 60 * 120, // 2 hours
    })
}

export const useSitenames = () => {
    return useQuery<FieldCatg[], AxiosError>({
        queryKey: qaKeys.sitenames(),
        queryFn: () => fetchSitenames(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        cacheTime: 1000 * 60 * 120, // 2 hours
    })
}

export const useFramecodes = () => {
    return useQuery<FieldCatg[], AxiosError>({
        queryKey: qaKeys.framecodes(),
        queryFn: () => fetchFramecodes(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        cacheTime: 1000 * 60 * 120, // 2 hours
    })
}

export const useMCA = () => {
    return useQuery<FieldCatg[], AxiosError>({
        queryKey: qaKeys.mcaCategories(),
        queryFn: () => fetchMcaCategories(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        cacheTime: 1000 * 60 * 120, // 2 hours
    })
}

export const useSkipLogicAudio = () => {
    return useQuery<FieldLogic[], AxiosError>({
        queryKey: qaKeys.skipLogicAudio(),
        queryFn: () => fetchCalltypeSkipLogic(),
        staleTime: 1000 * 60 * 10, // 10 minutes
        cacheTime: 1000 * 60 * 120, // 2 hours
    })
}

////////////////////////////////////////////////////////////////////////////////////////////////
// POST Hooks: 

// export const useMakeFormUpdates = (appID: number, queryParams: ReportAPIParams) => {
//   return useMutation(submitAIFormEdits, {
//     onSuccess: (data) => {
//       console.log("Submission successful, invalidating queries...")
      
//     },
//     onError: (error) => {
//       console.error("Error submitting changes:", error)
//     },
//     onSettled: () => {
//       console.log("Mutation has settled (either success or error).")
//       queryClient.invalidateQueries({ queryKey: reportKeys.aiForms(appID, queryParams) }) // invalidate current query to refetch data
//     }
//   })
// }