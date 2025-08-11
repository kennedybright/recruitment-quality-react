import { FC } from "react"
import { FormMode, FormRef } from "../../../../../lib/types/forms.types"
import { aliasTokens, HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import { FormAttributeInput, FormAttributeSelect } from '../../../../qaforms/components'
import { useDataContext } from "../../../../../lib/context/data.context"
import Flex from "@nielsen-media/maf-fc-flex"
import { useFormContext } from "../../../../../modules/qaforms/base/form.context"
import { useEditContext } from "../../../../edit-forms/base/edit.context"
import { TableData } from "@nielsen-media/maf-fc-table2"
import { sanitizeAlphaNumeric } from "../../../../../lib/utils/helpers"
import { useAIFormContext } from "../../../../../modules/qaforms/base/formAI.context"

export interface AudioSMPAttributeProps {
    mode: FormMode
    readonlyData?: TableData
    hookform?: HookForm
}

export const AudioSMPAttributeGroup: FC<AudioSMPAttributeProps> = ({
    mode,
    readonlyData,
    hookform,
 }) => {
    const { dropdowns } = useDataContext()

    if (mode === 'readonly') return (
        <Flex className='current form details__atttributes' flexDirection='row' gap={aliasTokens.space700} flexWrap='wrap'>
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='ri_id'
                title='RI ID'
                size='compact'                                                       
            />
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='ri_shift'
                title='RI Shift'
                size='compact'                                                       
            />
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='site_name_id'
                title='RI Site Name'
                size='compact'                                                          
            />
            <FormAttributeInput
                mode={mode}
                readonlyData={readonlyData}
                label='sample_id'
                title='Sample ID'
                size='compact'                                                         
            />
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='call_type_id'
                title='Call Type'
                size='compact'                                                            
            />
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='frame_code_id'
                title='Frame Code'
                size='compact'                                                           
            />
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='call_direction'
                title='Call Direcition'
                size='compact'                                                           
            />
        </Flex>
    )

    const ref = () => {
        switch(mode) {
            case 'new': {
                const { activeForm, formErrors, updateField } = useFormContext()
                
                return {
                    formRef: activeForm.formRef,
                    formErrors: formErrors,
                    onFieldChange: updateField
                }
            }

            case 'ai': {
                const { activeForm, formErrors, updateField } = useAIFormContext()
                
                return {
                    formRef: activeForm.formRef,
                    formErrors: formErrors,
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
        <Flex className='current form details__atttributes' flexDirection='row' gap={aliasTokens.space700} flexWrap='wrap'>
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='ri_id'
                title='RI ID'
                size='compact'
                items={dropdowns.ri_id.filter(ri => ri.lob === "Audio")}
                selectedValue={formRef.ri_id}
                onChange={(value) => {
                    onFieldChange("ri_id", value)
                    
                    // auto-populate RI's sitename
                    const riSiteName = dropdowns.ri_id.find(ri => ri.value === value).siteNameID
                    onFieldChange('site_name_id', riSiteName)
                }}                                                          
            />
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='ri_shift'
                title='RI Shift'
                size='compact'
                items={dropdowns.ri_shift}  
                selectedValue={formRef.ri_shift}  
                onChange={(value) => { onFieldChange("ri_shift", value) }}                                                              
            />
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='site_name_id'
                title='RI Site Name'
                size='compact'
                items={dropdowns.site_name_id}  
                selectedValue={formRef.site_name_id} 
                onChange={(value) => { onFieldChange("site_name_id", value) }}                                                               
            />
            <FormAttributeInput
                mode={mode}
                readonlyData={readonlyData}
                label='sample_id'
                title='Sample ID'
                size='compact'
                error={formRef.sample_id && !/^[0-9]+$/.test(String(formRef.sample_id))}
                value={formRef.sample_id} 
                clearable 
                onChange={(e) => {
                    onFieldChange("sample_id", sanitizeAlphaNumeric(e.target.value)) 
                }}
                onClear={(e) => { onFieldChange("sample_id", null) }}                                                          
            />
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='call_type_id'
                title='Call Type'
                size='compact'
                items={dropdowns.call_type_id}
                selectedValue={formRef.call_type_id} 
                onChange={(value) => { onFieldChange("call_type_id", value) }}                                                                 
            />
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='frame_code_id'
                title='Frame Code'
                size='compact'
                items={dropdowns.frame_code_id} 
                selectedValue={formRef.frame_code_id}    
                onChange={(value) => { onFieldChange("frame_code_id", value) }}                                                             
            />
            <FormAttributeSelect 
                mode={mode}
                readonlyData={readonlyData}
                label='call_direction'
                title='Call Direcition'
                size='compact'
                items={dropdowns.call_direction} 
                selectedValue={formRef.call_direction}
                onChange={(value) => { onFieldChange("call_direction", value) }}                                                                 
            />
        </Flex>
    )
}

