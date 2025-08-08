import { HookForm } from "@nielsen-media/maf-fc-foundation"
import { FC } from "react"
import { FormMode, FormRef } from "../../../../../lib/types/forms.types"
import { StyledToggle } from "../styles"
import { useFormContext } from "../../../base/form.context"
import { useEditContext } from "../../../../edit-forms/base/edit.context"
import { TableData } from "@nielsen-media/maf-fc-table2"
import { AudioSMPAttributeProps } from "./AudioSMPAttributeGroup"
import { useAIFormContext } from "../../../../../modules/qaforms/base/formAI.context"

export const AudioSMPToggleButton: FC<AudioSMPAttributeProps> = ({ 
    mode, 
    readonlyData,
    hookform
}) => {
    if (mode === 'readonly') return (
        <StyledToggle
            className='current form details__toggle'
            size='jumbo'
            data-selector='audio_smp'
            selectedValue={readonlyData.audio_smp}
        >
            <StyledToggle.Item
                className="toggle-button"
                label="Audio" 
                value="Audio"
            />
            <StyledToggle.Item 
                className="toggle-button" 
                label="SMP" 
                value="SMP"
            />
        </StyledToggle>
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
    const value = formRef.audio_smp
    const onFieldChange = ref().onFieldChange

    return (
        <StyledToggle
            className='current form details__toggle'
            size='jumbo'
            data-selector='audio_smp'
            selectedValue={value}
        >
            <StyledToggle.Item
                className="toggle-button"
                label="Audio" 
                value="Audio"
                selected={value === "Audio"}
                onChange={({ event, index, value, label }) => {
                    onFieldChange('audio_smp', value)
                }}
            />
            <StyledToggle.Item 
                className="toggle-button" 
                label="SMP" 
                value="SMP" 
                selected={value === "SMP"}
                onChange={({ event, index, value, label }) => {
                    onFieldChange('audio_smp', value)
                }}
            />
        </StyledToggle>
    )
}

