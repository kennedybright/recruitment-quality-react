import { FC } from "react"
import { FormMode, FormRef } from "../../../lib/types/forms.types"
import { HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import { useFormContext } from "../base/form.context"
import { useEditContext } from "../../edit-forms/base/edit.context"
import TextArea, { TextAreaProps } from "@nielsen-media/maf-fc-text-area"
import { TableData } from "@nielsen-media/maf-fc-table2"
import { useAIFormContext } from "../base/formAI.context"

export interface FormTextAreaProps extends TextAreaProps {
    mode: FormMode
    label: string
    title: string
    readonlyData?: TableData
    hookform?: HookForm
}

export const FormTextArea: FC<FormTextAreaProps> = ({
    mode,
    label,
    title,
    readonlyData,
    hookform,
    ...props
 }) => {
    const className = label.replaceAll('_', "-")

    if (mode === 'readonly') return (
        <TextArea
            className={className}
            label={title}
            value={readonlyData[label]}
            size='regular'
            readOnly 
            data-selector={label}
        />
    )

    const ref = () => {
        switch(mode) {
            case 'new': {
                const { activeFormRef, updateField } = useFormContext()
                
                return {
                    formRef: activeFormRef,
                    onFieldChange: updateField
                }
            }

            case 'ai': {
                const { activeFormRef, updateField } = useAIFormContext()
                
                return {
                    formRef: activeFormRef,
                    onFieldChange: updateField
                }
            }

            case 'edit': {
                const { form, updateFormChange } = useEditContext()
                
                return {
                    formRef: form,
                    onFieldChange: updateFormChange
                }
            }
        }
    }
    const formRef: FormRef = ref().formRef
    const value = formRef[label]
    const onFieldChange = ref().onFieldChange

    return (
        <TextArea
            {...props}
            className={className}
            size='regular'
            label={title}
            data-selector={label}
            value={value}
            onChange={(e) => {
                onFieldChange(label, e.target.value)
            }}
        />
    )
}

