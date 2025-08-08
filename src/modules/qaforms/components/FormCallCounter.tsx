import { FC, useEffect, useState } from "react"
import { StyledCounter } from "../styles"
import { useFormContext } from "../base/form.context"
import { useMAFContext } from "../../../maf-api"
import { CALLCOUNTERTABLECOLS } from "../base/constants"
import { SelectionsIcon } from "@nielsen-media/maf-fc-icons"

export const FormCallCounter: FC = () => {
    const { notifier: { banner } } = useMAFContext()
    const { qaForms } = useFormContext()

    const [callCounterData, setCallCounterData] = useState([]) // save Call Counter form counts
    useEffect(() => { // calulate the updated Call Counter form counts
        const countsByRI: Record<string, {riID:string, totalCount:number, live:number, nonlive:number}> = {}
    
        qaForms.forms.forEach((form) => {
            const riID: string = form.formRef.ri_id
            const isLive: boolean = form.formRef.live_call

            if (riID) { // Initialize counts for this riID if not already present
                if (!countsByRI[riID]) {
                    countsByRI[riID] = { riID, totalCount: 0, live: 0, nonlive: 0 }
                }
                countsByRI[riID].totalCount +=1
                isLive ? countsByRI[riID].live +=1 : countsByRI[riID].nonlive +=1    
            }
        })
        
        const tableData = Object.values(countsByRI).map(({riID, totalCount, live, nonlive}) => ({
            riID, 
            totalCount: String(totalCount), 
            live: String(live), 
            nonlive: String(nonlive)
        }))
        tableData.length > 0 ? setCallCounterData(Object.values(tableData)) : setCallCounterData([])
    }, [qaForms.forms])

    const [maxReachedNotified, setMaxReachedNotified] = useState([])
    useEffect(() => { // trigger banner notification if a user reaches max monitoring count for any RI
        const MAXRICOUNT = 100 // RI call threshold count
        const riCount = callCounterData.map(({riID, totalCount}) => ({riID, totalCount}))
        const maxReached = riCount.filter(({totalCount}) => totalCount >= MAXRICOUNT).map(({riID}) => riID )

        if (maxReached.length > 0) {
            const resetNotified = maxReachedNotified.filter((riID) => !maxReached.includes(riID))
            const newToBeNotified = maxReached.filter(riID => !maxReachedNotified.includes(riID)).filter(riID => !resetNotified.includes(riID))

            if (newToBeNotified.length > 0) {
                newToBeNotified.forEach(riID => {
                    banner.show(`You have reached the daily monitoring limit for RI: ${riID}.`, {
                        variant: banner.variant.warning,
                    })
                })
                setMaxReachedNotified((prev) => { return [...prev, ...newToBeNotified] })
            }

            if (resetNotified.length > 0) {
                setMaxReachedNotified((prev) => prev.filter((riID) => !resetNotified.includes(riID)))
            }
        } else {
            if (maxReachedNotified.length > 0) setMaxReachedNotified([]) // reset notified list
        }
    }, [callCounterData])
    
    return (
        <StyledCounter
            className="call-counter__ri"
            tableProps={{ 
                data: callCounterData, 
                columns: CALLCOUNTERTABLECOLS, 
                hideBorder: true, 
                striped: true, 
                size: "compact",
            }}
            title='RI Call Counter'
            headerCount={qaForms.forms?.length}
            emptyStateProps={{
                icon: { props: {icon: SelectionsIcon} },
                title: 'No Forms Saved.' // \nPlease save your forms to display progress.'
            }}
        />
    )
}