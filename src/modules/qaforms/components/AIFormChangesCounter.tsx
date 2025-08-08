import { FC } from "react"
import { StyledCounter } from "../styles"
import { useAIFormContext } from "../base/formAI.context"
import { FORMCHANGETABLECOLS } from "../base/constants"
import { CheckDashIcon } from "@nielsen-media/maf-fc-icons"

export const AIFormChangesCounter: FC = () => {
    const { formChanges } = useAIFormContext()
    
    return (
        <StyledCounter
            className="call-counter__form-changes"
            tableProps={{ 
                data: formChanges, 
                columns: FORMCHANGETABLECOLS, 
                hideBorder: true, 
                striped: true, 
                size: "compact",
            }}
            title='Form Changes'
            headerCount={formChanges.length}
            emptyStateProps={{
                icon: { props: {icon: CheckDashIcon} },
                title: "No Changes Made."
            }}
        />
    )
}