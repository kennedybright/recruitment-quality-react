import { FC, useEffect, useState } from "react"
import { FieldLogic, FormError, FormMode, FormRef } from "../../../../../lib/types/forms.types"
import { aliasTokens, HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import { useFormContext } from "../../../base/form.context"
import { useEditContext } from "../../../../edit-forms/base/edit.context"
import { useDataContext } from "../../../../../lib/context/data.context"
import Grid from "@nielsen-media/maf-fc-grid"
import { FormAttributeInput, FormScoringSelect } from '../../../../qaforms/components'
import { getFieldsbyType } from "../../../../../lib/utils/qa/buildQA"
import { TableData } from "@nielsen-media/maf-fc-table2"
import Flex from "@nielsen-media/maf-fc-flex"
import Banner from '@nielsen-media/maf-fc-banner'
import { FlexScoringBannerGroup } from "../../../styles"
import { AudioSMPAttributeProps } from "./AudioSMPAttributeGroup"

export interface AudioSMPScoringProps extends AudioSMPAttributeProps {
    enableSkipLogic: boolean
}

export const AudioSMPScoringGroup: FC<AudioSMPScoringProps> = ({
    mode,
    readonlyData,
    enableSkipLogic,
    hookform,
 }) => {
    const { dropdowns, skipLogicAudio, audioSMPScoring, formFields } = useDataContext()
    const audioSMPFields = formFields[1001]
    const scoringDropdowns = getFieldsbyType(audioSMPFields, "scoring_dropdown")
    const filteredScoringDropdowns = scoringDropdowns.filter(field => field.label !== 'disposition')

    if (mode === 'readonly') return (
        <Grid
            className="form-body-questions"
            gap={`${aliasTokens.space350} ${aliasTokens.space950}`}
            gridAutoFlow='row'
            gridTemplateColumns="1fr 1fr 1fr 1fr"
        >
            {Object.values(scoringDropdowns).map(f => { // scoring dropdown fields
                return <FormAttributeInput
                    mode={mode}
                    label={f.label}
                    title={f.name}
                    readonlyData={readonlyData}
                    size="regular"
                />
            })}
        </Grid>
    )

    const ref = () => {
        switch(mode) {
            case 'new': {
                const { activeForm, updateField, formErrors } = useFormContext()
                
                return {
                    formRef: activeForm.formRef,
                    activeForm: activeForm,
                    formErrors: formErrors,
                    onFieldChange: updateField
                }
            }

            case 'edit': {
                const { form, formErrors, updateFormChange } = useEditContext()
                
                return {
                    formRef: form,
                    formErrors: formErrors,
                    onFieldChange: updateFormChange
                }
            }
        }
    }
    const formRef: FormRef = ref().formRef
    const formErrorsRef: FormError[] = ref().formErrors
    const onFieldChange = ref().onFieldChange

     // add null option
    const updatedScoring = [{label: mode === 'new' ? "Select..." : "\u2014", value: null}, ...audioSMPScoring] 

    const formErrors = mode === 'new' 
        ? formErrorsRef?.filter(error => error.formID === ref().activeForm.formID)
        : formErrorsRef
    
    const calltypeError = formErrors?.find(error => error.error.includes("Invalid Calltype"))
    const framecodeError = formErrors?.find(error => error.error.includes("Invalid Framecode"))

    const [skipLogic, setSkipLogic] = useState<FieldLogic[]>(skipLogicAudio) // Filtered skip logic list
    useEffect(() => { // Update filtered skip logic list based on call type and form type
        if (enableSkipLogic) {
            const calltype = formRef.call_type_id
            const audioSmp = formRef.audio_smp
            
            if (calltype && !calltypeError) {
                const filteredLogic = skipLogicAudio?.filter((logic) => logic.calltype === calltype && logic.audioSMP === audioSmp)
                if (filteredLogic) {
                    setSkipLogic(filteredLogic)
                    Object.entries(formRef).forEach(([key, value]) => {
                        const disabled = filteredLogic.length > 0 && filteredLogic?.find((logic) => logic.field === key)?.disabled
                        if (disabled) formRef[key] = null
                    })
                }
            } else setSkipLogic([]) // reset filtered skip logic list
        }
    }, [enableSkipLogic, formRef.audio_smp, formRef.call_type_id])

    return (
        <Flex column className="form-body-scoring">
            <FlexScoringBannerGroup column className="form-errors" gap={aliasTokens.space600}>
                {calltypeError && (
                    <Banner
                        className="calltype-error"
                        message={`Form type, ${formRef.audio_smp}, cannot be submitted with call type, ${formRef.call_type_id}.`}
                        variant="error"
                    />
                )}
                {framecodeError && (
                    <Banner
                        className="framecode-error"
                        message={`Form type, ${formRef.audio_smp}, cannot be submitted with frame code, ${formRef.frame_code_id}.`}
                        variant="error"
                    />
                )}
            </FlexScoringBannerGroup>

            <Grid
                className="form-body-questions"
                gap={`${aliasTokens.space350} ${aliasTokens.space950}`}
                gridAutoFlow='row'
                gridTemplateColumns="1fr 1fr 1fr 1fr"
            >
                {Object.values(filteredScoringDropdowns).map(f => { // scoring dropdown fields
                    return <FormScoringSelect
                        mode={mode}
                        label={f.label}
                        title={f.name}
                        items={updatedScoring}
                        error={(calltypeError || framecodeError) ? true : false}
                        disabled={
                            enableSkipLogic && 
                            (skipLogic && 
                                skipLogic.length > 0 && 
                                skipLogic.find((logic) => logic.field === f.label)?.disabled
                            )
                        }
                        selectedValue={formRef[f.label]}
                        onChange={(value) => {
                            onFieldChange(f.label, value)
                        }}
                    />
                })}
                <FormScoringSelect 
                    mode={mode} 
                    label='disposition' 
                    title="Disposition" 
                    items={dropdowns.disposition}
                    error={(calltypeError || framecodeError) ? true : false}
                    selectedValue={formRef.disposition}
                    onChange={(value) => {
                        onFieldChange("disposition", value)
                    }}
                />
            </Grid>
        </Flex>
    )
}