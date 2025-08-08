import { FC } from "react"
import { StyledCounter } from "../styles"
import { useFormContext } from "../base/form.context"
import { FORMERRORTABLECOLS } from "../base/constants"
import { CheckDashIcon } from "@nielsen-media/maf-fc-icons"
import { useAIFormContext } from "../base/formAI.context"
import { FormMode } from "../../../lib/types/forms.types"

interface FormErrorCounterProps {
    mode: FormMode
}

export const FormErrorCounter: FC<FormErrorCounterProps> = ({mode}) => {
    const errors = () => {
        switch(mode) {
            case 'new': {
                const { formErrors } = useFormContext()
                return formErrors
            }

            case 'ai': {
                const { formErrors } = useAIFormContext()
                return formErrors
            }
        }
    }
    const formErrors = errors()
    
    return (
        <StyledCounter
            className="call-counter__form-errors"
            tableProps={{ 
                data: formErrors, 
                columns: FORMERRORTABLECOLS, 
                hideBorder: true, 
                striped: true, 
                size: "compact",
            }}
            title='Form Errors'
            headerCount={formErrors.length}
            emptyStateProps={{
                icon: { props: {icon: CheckDashIcon} },
                title: "No Errors Found!\nAll Forms Are Ready for Submission."
            }}
        />
    )
}