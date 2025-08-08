import { FC } from "react"
import { HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import Checkbox, { CheckboxProps } from "@nielsen-media/maf-fc-checkbox"

export interface FormAttributeCheckboxProps extends CheckboxProps {
    label: string
    title: string
    hookform?: HookForm
}

export const FormAttributeCheckbox: FC<FormAttributeCheckboxProps> = ({
    label,
    title,
    hookform,
    ...props
 }) => {
    const className = label.replaceAll('_', "-")

    return (
        <Checkbox
            {...props}
            className={className}
            size='regular'
            label={title}
            data-selector={label}
        />
    )
}

