import { FC } from "react"
import { FormMode } from "../../../lib/types/forms.types"
import { HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import { InputItemOption, SingleSelectProps } from "@nielsen-media/maf-fc-select"
import { FormAttributeInput } from "./FormAttributeInput"
import { StyledDropdown } from "../styles"
import { TableData } from "@nielsen-media/maf-fc-table2"

export interface FormAttributeSelectProps extends Omit<SingleSelectProps, 'items'> {
    mode: FormMode
    label: string
    title: string
    items?: InputItemOption[]
    readonlyData?: TableData
    hookform?: HookForm
}

export const FormAttributeSelect: FC<FormAttributeSelectProps> = ({
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
        <FormAttributeInput
            mode={mode}
            label={label}
            title={title}
            readonlyData={readonlyData}
            size={props.size}
        />
    )

    return (
        <StyledDropdown
            {...props}
            mode={mode}
            className={className}
            layout="vertical"
            maxHeight={mode === 'new' ? 's200' : 's300'}
            hasSelectionBar
            allowReselect
            searchable
            label={title}
            data-selector={label}
            required
            items={items}
        />
    )
}

