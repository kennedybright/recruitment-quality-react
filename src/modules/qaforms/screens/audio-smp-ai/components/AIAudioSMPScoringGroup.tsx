import { FC, useEffect, useState } from "react"
import { FieldLogic, FormError, FormMode, FormRef } from "../../../../../lib/types/forms.types"
import { aliasTokens, HookForm } from "@nielsen-media/maf-fc-foundation"
import { FieldValues } from "react-hook-form"
import { useAIFormContext } from "../../../base/formAI.context"
import { useDataContext } from "../../../../../lib/context/data.context"
import Grid from "@nielsen-media/maf-fc-grid"
import { FormAttributeInput, FormScoringSelect } from '../../../components'
import { getFieldsbyType } from "../../../../../lib/utils/qa/buildQA"
import { TableData } from "@nielsen-media/maf-fc-table2"
import Flex from "@nielsen-media/maf-fc-flex"
import Banner from '@nielsen-media/maf-fc-banner'
import { FlexScoringBannerGroup } from "../../../styles"
import { AudioSMPScoringProps } from "../../audio-smp/components/AudioSMPScoringGroup"
import { DEVIATIONCATEGORY } from "../../../../../modules/qaforms/base/constants"
import { AIScoringAnalysis } from "./AIScoringAnalysis"
import Chip from '@nielsen-media/maf-fc-info-chip'

export const AIAudioSMPScoringGroup: FC<Omit<AudioSMPScoringProps, 'enableSkipLogic'>> = ({
    mode,
    readonlyData,
    hookform,
 }) => {
    const { dropdowns, audioSMPScoring, formFields } = useDataContext()
    const audioSMPFields = formFields[1001]
    const scoringDropdowns = getFieldsbyType(audioSMPFields, "scoring_dropdown")

    if (mode === 'readonly') return (
        <Grid
            className="form-body-questions"
            gap={`${aliasTokens.space350} ${aliasTokens.space950}`}
            gridAutoFlow='row'
            gridTemplateColumns="1fr 1fr 1fr 1fr"
        >
            {Object.values(scoringDropdowns).map(f => { // scoring dropdown fields
                const result = readonlyData[f.label] ? (f.label === "disposition" ? readonlyData[f.label] : Object.values(readonlyData[f.label])[0] as number) : null
                const deviation = f.label === "disposition" 
                    ? (formRef.disposition === "CORRECT" ? "Passed" : "Failed") 
                    : DEVIATIONCATEGORY.find(catg => catg.value === result)?.label
                const deviationColor = deviation === "Passed" ? Chip.Variant.success : (deviation === "Validation Needed" ? Chip.Variant.warning : Chip.Variant.danger)
                
                return (
                    <Flex column gap={aliasTokens.space200}>
                        <FormAttributeInput
                            mode={mode}
                            label={f.label}
                            title={f.name}
                            value={result}
                            size="regular"
                            chip={result ? { label: deviation, variant: deviationColor } : undefined}
                        />
                        <AIScoringAnalysis label={f.name} analysis={readonlyData[f.label]} />
                    </Flex>
                )
            })}
        </Grid>
    )

    const { filteredData, activeForm, updateField, formErrors } = useAIFormContext()
    const filteredScoringCategories = getFieldsbyType(filteredData.forms[0]?.fields, "scoring_dropdown")
    const filteredScoringWoDisposition = filteredScoringCategories?.filter(field => field.label !== 'disposition') || []
    const formRef = activeForm.formRef

     // add null option
    const updatedScoring = [{label: "Select...", value: null}, ...audioSMPScoring]
    
    const calltypeError = formErrors?.find(error => error.error.includes("Invalid Calltype"))
    const framecodeError = formErrors?.find(error => error.error.includes("Invalid Framecode"))

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
                {Object.values(filteredScoringWoDisposition).map(f => { // scoring dropdown fields
                    const result = formRef[f.label] !== null ? Object.entries(formRef[f.label]).find(([key, value]) => key.endsWith("-result"))[1] as number : null
                    const deviation = DEVIATIONCATEGORY.find(catg => catg.value === result)?.label
                    const deviationColor = deviation === "Passed" ? Chip.Variant.success : (deviation === "Validation Needed" ? Chip.Variant.warning : Chip.Variant.danger)
                    
                    return (
                        <Flex column gap={aliasTokens.space200}>
                            <FormScoringSelect
                                mode={mode}
                                label={f.label}
                                title={f.name}
                                items={updatedScoring}
                                error={(calltypeError || framecodeError) ? true : false}
                                selectedValue={result}
                                onChange={(value) => {
                                    const resultKey = `${f.label.replaceAll("_", "-")}-result`

                                    if (value === null) {
                                        updateField(f.label, null) // set to null
                                        return
                                    }

                                    if (result === null) {
                                        updateField(f.label, {[resultKey]: value}) // create new JSON scoring
                                    } else {
                                        // replace existing JSON scoring result value
                                        const updatedJSON = { ...formRef[f.label], [resultKey]: value }
                                        updateField(f.label, updatedJSON)
                                    }
                                }}
                                chip={result === null ? undefined : { label: deviation, variant: deviationColor }}
                            />
                            <AIScoringAnalysis label={f.name} analysis={formRef[f.label]} />
                        </Flex>
                    )
                })}
                {filteredScoringCategories?.some(scoring => scoring.label === "disposition") && (
                    <Flex column gap={aliasTokens.space200}>
                        <FormScoringSelect 
                            mode={mode} 
                            label='disposition' 
                            title="Disposition" 
                            items={dropdowns.disposition}
                            error={(calltypeError || framecodeError) ? true : false}
                            selectedValue={formRef.disposition}
                            onChange={(value) => {
                                updateField("disposition", value)
                            }}
                            chip={formRef.disposition === null ? undefined : {
                                label: formRef.disposition === "CORRECT" ? "Passed" : "Failed",
                                variant: formRef.disposition === "CORRECT" ? Chip.Variant.success : Chip.Variant.danger
                            }}
                        />
                        <AIScoringAnalysis label="Disposition" />
                    </Flex>
                )}
            </Grid>
        </Flex>
    )
}