import { FC } from "react"
import { FormMode } from "../../../lib/types/forms.types"
import { HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import { StyledInputField } from "../styles"
import { InputProps } from "@nielsen-media/maf-fc-input"
import { TableData } from "@nielsen-media/maf-fc-table2"

export interface FormAttributeInputProps extends InputProps {
    mode: FormMode
    label: string
    title: string
    readonlyData?: TableData
    hookform?: HookForm
}

export const FormAttributeInput: FC<FormAttributeInputProps> = ({
    mode,
    label,
    title,
    readonlyData,
    hookform,
    ...props
 }) => {
    const className = label.replaceAll('_', "-")

    if (mode === 'readonly') return (
        <StyledInputField
            {...props}
            className={className}
            label={title}
            layout="vertical"
            readOnly 
            data-selector={label}
            value={readonlyData[label]}
            size={props.size}
        />
    )

    return (
        <StyledInputField
            {...props}
            className={className}
            layout="vertical"
            label={title}
            data-selector={label}
            required
            clearable
        />
    )
}

