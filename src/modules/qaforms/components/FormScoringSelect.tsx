import { FC } from "react"
import { FormMode } from "../../../lib/types/forms.types"
import { HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import { InputItemOption, SingleSelect, SingleSelectProps } from "@nielsen-media/maf-fc-select"
import HookFormInput from '@nielsen-media/maf-fc-input'
import { TableData } from "@nielsen-media/maf-fc-table2"

export interface FormScoringSelectProps extends Omit<SingleSelectProps, 'items'> {
    mode: FormMode
    label: string
    title: string
    items?: InputItemOption[]
    readonlyData?: TableData
    hookform?: HookForm
}

export const FormScoringSelect: FC<FormScoringSelectProps> = ({
    mode,
    label,
    title,
    items,
    readonlyData,
    hookform,
    ...props
 }) => {
    const className = label.replaceAll('_', "-")

    if (mode === 'readonly') return (
        <HookFormInput
            className={className}
            label={title}
            layout="vertical"
            size='regular'
            readOnly 
            data-selector={label}
            value={readonlyData[label]}
            disabled={readonlyData[label] === null}
        />
    )

    return (
        <SingleSelect
            {...props}
            className={className}
            size='regular'
            layout="vertical"
            allowReselect
            label={title}
            data-selector={label}
            items={items}
        />
    )
}

