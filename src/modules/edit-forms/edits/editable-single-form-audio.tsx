// Test using Record Number: 3249189

import { useState, useEffect } from 'react'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FlexFormDetails, StyledInputField, StyledToggle } from '../../qaforms/qaforms-audio-smp/styles'
import { FlexWrapper, FlexFormHeader, StyledDropdown, FlexFormBody } from '../styles'
import Flex from '@nielsen-media/maf-fc-flex'
import { ResetIcon, UserCircleFillIcon } from '@nielsen-media/maf-fc-icons' 
import Text from '@nielsen-media/maf-fc-text'
import List from '@nielsen-media/maf-fc-list'
import Checkbox from '@nielsen-media/maf-fc-checkbox'
import { getFieldsbyRange } from '../../../lib/utils/qa-forms'
import TextArea from '@nielsen-media/maf-fc-text-area'
import Grid from '@nielsen-media/maf-fc-grid'
import { formatDateTime } from '../../../lib/utils/shared'
import { useEditContext } from './edits'
import { SingleSelect } from '@nielsen-media/maf-fc-select'
import { FieldValues, useForm } from 'react-hook-form'
import { useDataContext } from '../../../lib/context/static-data'
import { useMAFContext } from '../../../maf-api'
import Button from '@nielsen-media/maf-fc-button'
import { Divider } from '../../../lib/global/styles'

const QAFormSingleEditableAudio = () => {
    const { notifier: { banner } } = useMAFContext()
    const { dropdowns, audioSMPScoring, formFields } = useDataContext() // Get all dropdown and form fields lists
    const { form, updateFormChange, clearAllEdits } = useEditContext()
    
    const methods = useForm<FieldValues>({ defaultValues: { ...form } })
    const { watch } = methods
    
    const fullDateISO = `${form.record_date}T${form.record_time}`
    const { formattedDate, formattedTime } = formatDateTime(new Date(fullDateISO))

    const fields = formFields[1001]
    const scoringDropdowns = getFieldsbyRange(fields, 19, 56).map(field => {
        // Replace dashes and convert string to title case
        if (field.name.includes("Hh")) return { ...field, name: field.name.replace("Hh", "HH") }
        if (field.name.includes("Tv")) return { ...field, name: field.name.replace("Tv", "TV") }
        if (field.name.includes("mvpd")) return { ...field, name: field.name.replace("Vmvpd", "vMVPD") }
        return field
    })

    const qaCheckboxes = getFieldsbyRange(fields, 13, 16)
    const mcaCheckboxes = getFieldsbyRange(fields, 61, 65)

    // set Disabled on Live/DoNotPrint checkbox -> Live means Do Not Print disabled OR Do Not Print means Live disabled
    const [disabled, setDisabled] = useState("")
    useEffect(() => { // update disabled when the active form changes
        const liveCall = form.live_call
        const doNotPrint = form.do_not_print
        const disabled = !liveCall ? !doNotPrint ? "" : "live_call" : "do_not_print"
        setDisabled(disabled)
    }, [form.do_not_print, form.live_call])

    const AudioSMP = form.audio_smp
    const CallType = form.call_type_id
    const [currentFormType, setCurrenFormType] = useState(AudioSMP) // Current call type
    const [typeError, setTypeError] = useState<boolean>(false)
    useEffect(() => { // Set form type error
        const audioSmp = form.audio_smp
        const calltype = form.call_type_id
        setCurrenFormType(audioSmp)

        if (audioSmp === "SMP" && (calltype === "FL" || calltype === "SP")) { 
            // notify user of incorrect combination of form type and call type
            setTypeError(true)
            banner.show( 
                `Form type, ${audioSmp}, cannot be submitted with calltype, ${calltype}.`,
                {variant: banner.variant.error}
            )
        } else { setTypeError(false) }
    }, [AudioSMP, CallType])

    return (
        <FlexWrapper column gap={aliasTokens.space450} className='single-qa-form-edit'>
            <Flex className="single-form-header-btns" flexDirection='row' gap={aliasTokens.space500} justifyContent='space-between'>
                <Flex className='single-form-header' gap={aliasTokens.space350}>
                    <Text className='current-form-title' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold}>
                        Edit Single Form:
                    </Text>
                    <Text className='current-form-number' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold} color={aliasTokens.color.primary600}>
                        {form.record_number}
                    </Text>
                </Flex>
                <Button className='exit'
                    type='button'
                    variant='tertiary'
                    size='compact'  
                    view='outlined'
                    aria-label='page-top-exit'
                    roundedCorners='all'
                    icon={{
                        icon: ResetIcon,
                        iconPosition: 'left'
                    }}
                    onClick={clearAllEdits}
                >
                    Reset All Changes
                </Button>
            </Flex>
            <FlexFormHeader className="current-form-header" column gap={aliasTokens.space350}>
                <FlexFormDetails className='current-form-details' column gap={aliasTokens.space700} alignItems='center'>
                    <StyledToggle
                        className='form-type-toggle'
                        selectedValue={currentFormType}
                        size='jumbo'
                        data-selector='audio_smp'
                        onChange={({ event, index, value, label }) => { setCurrenFormType(value.toString()) }}
                    >
                        <StyledToggle.Item
                            className="audio-toggle"
                            label="Audio" 
                            value="Audio"
                            selected={form.audio_smp === "Audio"}
                            onChange={({ event, index, value, label }) => { updateFormChange('audio_smp', value=value.toString()) }}
                        />
                        <StyledToggle.Item 
                            className="smp-toggle" 
                            label="SMP" 
                            value="SMP" 
                            selected={form.audio_smp === "SMP"}
                            onChange={({ event, index, value, label }) => { updateFormChange('audio_smp', value=value.toString()) }}
                        />
                    </StyledToggle>
                    <List className="details-current-form-metadata" size='regular' groupDirection='row' hasDivider>
                        <List.Item className='record-date' data-selector='record_date' body={formattedDate} heading={"Record Date"} />
                        <List.Item className='record-time' data-selector='record_time' body={formattedTime} heading={"Record Time"} />
                        <List.Item className='qr-id' data-selector='qr_id' body={form.qr_id} heading={"QR ID"} icon={UserCircleFillIcon} />
                    </List>
                    <Flex className="details-current-form-attributes" flexDirection='row' gap={aliasTokens.space700} flexWrap='wrap'>
                        <StyledDropdown
                            className='edit-ri-id'
                            size='compact'
                            hasSelectionBar
                            label="RI ID"
                            data-selector='ri_id'
                            items={dropdowns.ri_id.map(({label, value}) => ({ label, value }))}
                            layout="vertical"
                            maxHeight="s300"
                            required
                            allowReselect
                            searchable
                            initialValue={form.ri_id}
                            selectedValue={form.ri_id}
                            onChange={(value) => {
                                console.log("new value: ", value)
                                updateFormChange('ri_id', value.toString())
                                updateFormChange('site_name_id', dropdowns.ri_id.find(ri => ri.label === value.toString())?.siteNameID) // auto-populate RI's site name
                            }}
                        />
                        <StyledDropdown
                            className='edit-ri-shift'
                            size='compact'
                            hasSelectionBar
                            label="RI Shift"
                            data-selector='ri_shift'
                            items={dropdowns.ri_shift}
                            layout="vertical"
                            maxHeight="s200"
                            required
                            allowReselect
                            initialValue={form.ri_shift}
                            selectedValue={form.ri_shift}
                            onChange={(value) => { updateFormChange('ri_shift', value.toString()) }}
                        />
                        <StyledDropdown
                            className='edit-site-name'
                            size='compact'
                            hasSelectionBar
                            label="RI Site Name"
                            data-selector='site_name_id'
                            items={dropdowns.site_name_id}
                            layout="vertical"
                            maxHeight="s200"
                            required
                            allowReselect
                            initialValue={form.site_name_id}
                            selectedValue={form.site_name_id}
                            onChange={(value) => { updateFormChange('site_name_id', value.toString()) }}
                        />
                        <StyledInputField
                            className='edit-sample-id'
                            label="Sample ID" 
                            required 
                            initialValue={!form.sample_id ? "" : form.sample_id}
                            value={form.sample_id}
                            size='compact' 
                            data-selector='sample_id'
                            onChange={(e) => { updateFormChange('sample_id', e.target.value) }}
                            error={form.sample_id && !/^[0-9]+$/.test(form.sample_id)}
                        />
                        <StyledDropdown
                            className='edit-call-type'
                            size='compact'
                            hasSelectionBar
                            label="Call Type"
                            data-selector='call_type_id'
                            items={dropdowns.call_type_id}
                            layout="vertical"
                            maxHeight="s200"
                            required
                            allowReselect
                            initialValue={form.call_type_id}
                            selectedValue={form.call_type_id}
                            onChange={(value) => { updateFormChange('call_type_id', value.toString()) }}
                        />
                        <StyledDropdown
                            className='edit-frame-code'
                            size='compact'
                            hasSelectionBar
                            label="Frame Code"
                            data-selector='frame_code_id'
                            items={dropdowns.frame_code_id}
                            layout="vertical"
                            maxHeight="s200"
                            required
                            allowReselect
                            initialValue={form.frame_code_id}
                            selectedValue={form.frame_code_id}
                            onChange={(value) => { updateFormChange('frame_code_id', value.toString()) }}
                        />
                        <StyledDropdown
                            className='edit-call-direction'
                            size='compact'
                            hasSelectionBar
                            label="Call Direction"
                            data-selector='call_direction'
                            items={dropdowns.call_direction}
                            layout="vertical"
                            maxHeight="s200"
                            required
                            allowReselect
                            initialValue={form.call_direction}
                            selectedValue={form.call_direction}
                            onChange={(value) => { updateFormChange('call_direction', value.toString()) }}
                        />
                    </Flex>
                    <Flex className="details-current-form-call-attributes" alignSelf='center' flexDirection='row' gap={aliasTokens.space850}
                    >
                        {Object.values(qaCheckboxes).map(f => (
                            <Checkbox
                                className={`edit-${f.label.replaceAll("_", "-")}`}
                                size='regular' 
                                label={f.name}
                                data-selector={f.label}
                                disabled={disabled === f.label}
                                checked={disabled !== f.label && form[f.label]}
                                onChange={(e, {checked, indeterminate}) => {
                                    if (f.label === "live_call" && checked) setDisabled("do_not_print")
                                    if (f.label === "do_not_print" && checked) setDisabled("live_call")
                                    updateFormChange(f.label, checked)
                                }}
                            />
                        ))}
                    </Flex>
                </FlexFormDetails>
            </FlexFormHeader>
            <FlexFormBody className='current-form-body' flexDirection='row' column gap={aliasTokens.space700}>
                <Flex className='form-body-header-text' column gap={0} flexBasis='68%'>
                    <Text className="form-body-title" externalAs='h3' fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold}>
                        Recruitment QA Assessment
                    </Text>
                    <Text className="form-body-subtitle" fontSize={Text.FontSize.s100} fontWeight={Text.FontWeight.regular} color={aliasTokens.color.neutral700}>
                        Confirm the form details for the current phone call. Please review the call and complete the appropriate fields accurately. Ensure that each section is reviewed before submitting the form.
                    </Text>
                </Flex>
            <Grid
                className="form-body-questions"
                gap={`${aliasTokens.space350} ${aliasTokens.space950}`}
                gridAutoFlow='row'
                gridAutoRows='76px'
                gridTemplateColumns="1fr 1fr 1fr 1fr"
            >
                {Object.values(scoringDropdowns).map(f => { // scoring dropdown fields
                    return <SingleSelect
                        className={`edit-${f.label.replaceAll("_", "-")}`}
                        label={f.name}
                        items={audioSMPScoring}
                        size='regular'
                        allowReselect
                        error={typeError}
                        data-selector={f.label}
                        initialValue={form[f.label]}
                        selectedValue={form[f.label]}
                        onChange={(value) => { updateFormChange(f.label, value) }}
                    />
                })}
                <SingleSelect
                    className="edit-disposition"
                    label={"Disposition"}
                    items={dropdowns.disposition}
                    size='regular'
                    data-selector='disposition'
                    allowReselect
                    initialValue={form.disposition}
                    error={typeError}
                    selectedValue={form.disposition === "" ? watch("disposition") : form.disposition}
                    onChange={(value) => { updateFormChange("disposition", value.toString()) }}
                />
            </Grid>
            <TextArea
                className="edit-form-call-notes"
                size='regular'
                label='Call Notes'
                data-selector='call_notes'
                value={form.call_notes === "" ? watch("call_notes") : form.call_notes}
                onChange={(e) => { updateFormChange("call_notes", e.target.value) }}
            />
            <Divider />
            <SingleSelect
                className="edit-mca-category"
                label={"MCA Category"}
                items={dropdowns.mca_category}
                initialValue={form.mca_category}
                data-selector='mca_category'
                size='regular'
                allowReselect
                selectedValue={form.mca_category === "" ? watch("mca_category") : form.mca_category}
                onChange={(value) => { updateFormChange("mca_category", value.toString()) }}
            />
            <Flex className='mca-attributes' alignSelf='center' flexDirection='row' gap={aliasTokens.space900} justifySelf='center' flexWrap='wrap'>
                {Object.values(mcaCheckboxes).map(f => (
                    <Checkbox
                        className={`edit-${f.label.replaceAll("_", "-")}`}
                        size='regular'
                        data-selector={f.label} 
                        label={f.name}
                        checked={form[f.label]}
                        onChange={(e, {checked, indeterminate}) => { updateFormChange(f.label, checked) }}
                    />
                ))}
            </Flex>
            <Flex className="mca-call-notes" flexDirection='row' gap={aliasTokens.space700}>
                <TextArea 
                    className="edit-mca-summary-observation" 
                    size='regular' 
                    label='MCA Summary of Observation' 
                    data-selector='mca_summary_observation'
                    value={form.mca_summary_observation === "" ? watch("mca_summary_observation") : form.mca_summary_observation}
                    onChange={(e) => { updateFormChange("mca_summary_observation", e.target.value) }}
                />
            </Flex>
            </FlexFormBody>
        </FlexWrapper>
    )
}

export default QAFormSingleEditableAudio