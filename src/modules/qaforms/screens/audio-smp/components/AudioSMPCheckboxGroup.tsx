import { FC, useEffect, useState } from "react"
import { aliasTokens, HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import { useDataContext } from "../../../../../lib/context/data.context"
import Flex from "@nielsen-media/maf-fc-flex"
import { AudioSMPAttributeProps } from "./AudioSMPAttributeGroup"
import { getFieldsbyType } from "../../../../../lib/utils/qa/buildQA"
import { FormAttributeCheckbox } from "../../../../qaforms/components/FormAttributeCheckbox"
import { useFormContext } from "../../../../../modules/qaforms/base/form.context"
import { useEditContext } from "../../../../edit-forms/base/edit.context"
import { FormRef } from "../../../../../lib/types/forms.types"
import { useAIFormContext } from "../../../../../modules/qaforms/base/formAI.context"

export const AudioSMPFormCheckboxGroup: FC<AudioSMPAttributeProps> = ({
    mode,
    readonlyData,
    hookform
 }) => {
    const { formFields } = useDataContext()
    const audioSMPFields = formFields[1001]
    const qaCheckboxes = getFieldsbyType(audioSMPFields, "form_checkbox")

    if (mode === 'readonly') return (
        <Flex className='current-form-details__atttributes' alignSelf='center' flexDirection='row' gap={aliasTokens.space850}>
            {Object.values(qaCheckboxes).map(f => (
                <FormAttributeCheckbox 
                    label={f.label} 
                    title={f.name} 
                    checked={readonlyData[f.label]}
                />
            ))}
        </Flex>
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
    const onFieldChange = ref().onFieldChange

    const [disabled, setDisabled] = useState("")
    useEffect(() => { // update disabled when the active form changes
        const disabled = !formRef.live_call ? !formRef.do_not_print ? "" : "live_call" : "do_not_print"
        setDisabled(disabled)
    }, [formRef.live_call, formRef.do_not_print])

    return (
        <Flex className='current-form-details__atttributes' alignSelf='center' flexDirection='row' gap={aliasTokens.space850}>
            {Object.values(qaCheckboxes).map(f => (
                <FormAttributeCheckbox 
                    label={f.label} 
                    title={f.name} 
                    disabled={disabled === f.label}
                    checked={disabled !== f.label && formRef[f.label]}
                    onChange={(e, {checked, indeterminate}) => {
                        if (f.label === "live_call" && checked) setDisabled("do_not_print")
                        if (f.label === "do_not_print" && checked) setDisabled("live_call")
                        onFieldChange(f.label, checked)
                    }}
                />
            ))}
        </Flex>
    )
}

export const AudioSMPMCACheckboxGroup: FC<AudioSMPAttributeProps> = ({
    mode,
    readonlyData,
    hookform
 }) => {
    const { formFields } = useDataContext()
    const audioSMPFields = formFields[1001]
    const mcaCheckboxes = getFieldsbyType(audioSMPFields, "scoring_checkbox")

    if (mode === 'readonly') return (
        <Flex className='mca-scoring__atttributes' alignSelf='center' flexDirection='row' gap={aliasTokens.space900} justifySelf='center' flexWrap='wrap'>
            {Object.values(mcaCheckboxes).map(f => (
                <FormAttributeCheckbox 
                    label={f.label} 
                    title={f.name}
                    checked={readonlyData[f.label]}
                />
            ))}
        </Flex>
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
    const onFieldChange = ref().onFieldChange

    return (
        <Flex className='mca-scoring__atttributes' alignSelf='center' flexDirection='row' gap={aliasTokens.space900} justifySelf='center' flexWrap='wrap'>
            {Object.values(mcaCheckboxes).map(f => (
                <FormAttributeCheckbox 
                    label={f.label} 
                    title={f.name}
                    checked={formRef[f.label]}
                    onChange={(e, {checked, indeterminate}) => {
                        onFieldChange(f.label, checked)
                    }} 
                />
            ))}
        </Flex>
    )
}
