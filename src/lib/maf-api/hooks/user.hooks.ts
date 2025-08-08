import { useQuery } from "react-query"
import userKeys from "../query-keys/user.keys"
import { fetchCurrentUser } from "../services/user.service"
import { AxiosError } from "axios"
import { SystemUser } from "../../types/global.types"
import { TECH_SUPPORT_ADMIN } from "../../env"

export const useCurrentUser = (email: string) => {
    return useQuery<SystemUser, AxiosError>({
        queryKey: userKeys.currentUser(email),
        queryFn: () => fetchCurrentUser(email).then((user) => {
            if (email === TECH_SUPPORT_ADMIN.email) {
                return { ...user, qrID: "ADMIN", siteName: "INTERNAL" }
            }
            
            return {
                ...user,
                qrID: user.qrID === "" ? "N/A" : user.qrID, 
                siteName: user.siteName === "" ? "N/A" : user.siteName 
            }
        }),
        enabled: !!email, // prevent firing until email is available
        staleTime: Infinity,
        cacheTime: 1000 * 60 * 60, // 1 hour in memory
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false
    })
}

// To manually invalidate this query: queryClient.invalidateQueries(userKeys.currentUser(email))