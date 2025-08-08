import { FC } from "react"
import { FormMode } from "../../../lib/types/forms.types"
import { HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import { SingleSelect, SingleSelectProps } from "@nielsen-media/maf-fc-select"

export interface FormScoringSelectProps extends SingleSelectProps {
    mode: FormMode
    label: string
    title: string
    hookform?: HookForm
}

export const FormScoringSelect: FC<FormScoringSelectProps> = ({
    mode,
    label,
    title,
    hookform,
    ...props
 }) => {
    const className = label.replaceAll('_', "-")

    return (
        <SingleSelect
            {...props}
            className={className}
            size='regular'
            layout="vertical"
            allowReselect
            label={title}
            data-selector={label}
        />
    )
}

