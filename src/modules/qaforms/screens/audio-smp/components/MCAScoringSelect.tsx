import { FC } from "react"
import { FormRef } from "../../../../../lib/types/forms.types"
import { HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import { FormScoringSelect } from '../../../../qaforms/components'
import { useFormContext } from "../../../base/form.context"
import { useEditContext } from "../../../../edit-forms/base/edit.context"
import { useDataContext } from "../../../../../lib/context/data.context"
import { TableData } from "@nielsen-media/maf-fc-table2"
import { AudioSMPAttributeProps } from "./AudioSMPAttributeGroup"
import { useAIFormContext } from "../../../../../modules/qaforms/base/formAI.context"

export const MCAScoringSelect: FC<AudioSMPAttributeProps> = ({
    mode,
    readonlyData,
    hookform,
 }) => {
    const { dropdowns } = useDataContext()

    if (mode === 'readonly') return (
        <FormScoringSelect
            mode={mode}
            label='mca_category' 
            title="MCA Category" 
            readonlyData={readonlyData}
        />
    )

    const ref = () => {
        switch(mode) {
            case 'new': {
                const { activeForm, updateField } = useFormContext()
                
                return {
                    formRef: activeForm.formRef,
                    onFieldChange: updateField
                }
            }

            case 'ai': {
                const { activeForm, updateField } = useAIFormContext()
                
                return {
                    formRef: activeForm.formRef,
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
        <FormScoringSelect
            mode={mode}
            label='mca_category' 
            title="MCA Category"
            items={[{
                label: mode === 'new' ? "Select MCA Category..." : "\u2014",
                value: null
            }, ...dropdowns.mca_category]}
            selectedValue={formRef.mca_category}
            onChange={(value) => { onFieldChange("mca_category", value) }}        
        />
    )
}

