import { FC, useEffect, useState } from 'react'
import { useFormContext } from '../../forms'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FlexBody, FlexWrapperFooterBtnGroup, FlexFormSubmission, StyledDeleteIcon, StyledSubmitIcon } from '../styles'
import Flex from '@nielsen-media/maf-fc-flex' 
import Text from '@nielsen-media/maf-fc-text'
import Checkbox from '@nielsen-media/maf-fc-checkbox'
import TextArea from '@nielsen-media/maf-fc-text-area'
import { SingleSelect } from '@nielsen-media/maf-fc-select'
import Grid from '@nielsen-media/maf-fc-grid'
import Button from '@nielsen-media/maf-fc-button'
import { AddCircleOutlineIcon, CheckmarkIcon, ErrorOutlineIcon, IconSvgProps, WarningFillIcon } from '@nielsen-media/maf-fc-icons'
import { FieldLogic, useDataContext } from '../../../../lib/context/static-data'
import { useMAFContext } from '../../../../maf-api'
import { Divider } from '../../../../lib/global/styles'
import { resetQA } from '../../../../lib/utils/qa-forms'
import { emailErrorReport } from '../../../../lib/maf-api/api-form-data'
import Dialog from '@nielsen-media/maf-fc-dialog'
import AdjustCSS from '../../../../lib/utils/adjust-css'

const QAFormBody: FC = () => {
    const { 
        selectors: { useUserData },
        notifier: { banner, dialog } 
    } = useMAFContext()
    const { firstName, lastName } = useUserData() // get system user information
    const { audioSMPScoring, mcaCategoryList, dispositionList, skipLogicList } = useDataContext()
    const { methods, activeForm, activeFields, qaForms, updateActiveForm, updateField, deleteCurrentForm, createNewForm, getFields, onSubmit, isSuccessful, submissionMessage } = useFormContext()
    const { watch } = methods

    const scoringDropdowns = getFields(19, 56).map(field => {
        // Replace dashes and convert string to title case
        if (field.name.includes("Hh")) return { ...field, name: field.name.replace("Hh", "HH") }
        if (field.name.includes("Tv")) return { ...field, name: field.name.replace("Tv", "TV") }
        if (field.name.includes("mvpd")) return { ...field, name: field.name.replace("Vmvpd", "vMVPD") }
        return field
    })
    const mcaCheckboxes = getFields(61, 65)

    const CallType = activeFields.find((field) => field.label === "call_type_id").value
    const AudioSmp = activeFields.find((field) => field.label === "audio_smp").value
    const [typeError, setTypeError] = useState<boolean>(false)
    const [skipLogic, setSkipLogic] = useState<FieldLogic[]>(skipLogicList) // Filtered skip logic list
    useEffect(() => { // Update filtered skip logic list based on call type and form type
        const calltype = activeFields.find((field) => field.label === "call_type_id").value
        const audioSmp = activeFields.find((field) => field.label === "audio_smp").value

        if (calltype !== "") {
            if (audioSmp === "SMP" && (calltype === "FL" || calltype === "SP")) { // set form error
                // notify user of incorrect combination of form type and call type
                setTypeError(true)
                banner.show( 
                    `Form type, ${audioSmp}, cannot be submitted with calltype, ${calltype}.`,
                    {variant: banner.variant.error}
                )
            } else {
                setTypeError(false)
                const filteredLogic = skipLogicList?.filter((logic) => logic.calltype === calltype && logic.audioSMP === audioSmp)
                if (filteredLogic) {
                    setSkipLogic(filteredLogic)
                    const updatedActiveFormFields = activeFields.map((f) => { // update scoring dropdown fields by skip logic
                        if (scoringDropdowns.some(field => field.label === f.label)) {
                            const disabled = filteredLogic.length > 0 ? filteredLogic.find((logic) => logic.field === f.label).disabled : false
                            if (!disabled && activeFields.find((field) => field.label === f.label).value === undefined) return {...f, value: 0} // update value to default 0 if not disabled
                            if (disabled) return {...f, value: undefined} // reset value if disabled
                        }
                        return f
                    })
                    const updatedActiveForm = {...activeForm, fields: updatedActiveFormFields}
                    updateActiveForm(updatedActiveForm)
                }
            }
        } else {
            setSkipLogic([]) // reset filtered skip logic list
        }
    }, [AudioSmp, CallType])

    const [toSubmit, setToSubmit] = useState<boolean>(false)
    const exit = () => {
        setToSubmit(false)
        console.log("Exiting Audio/SMP QA monitoring form...")
        resetQA(1001) // delete localStorage
        window.location.reload() // refresh the page
    }

    const onError = (message) => {
        const userFullName = `${firstName} ${lastName}`
        setToSubmit(false)
        console.log(`${message} Sending error report...`)
        emailErrorReport(userFullName, 'Forms submission attempt', message)
    }
    
    console.log("form-body // activeFields: ", activeFields)

    return (
        <FlexBody className='form-body' flexDirection='row' column gap={aliasTokens.space700}>
            <AdjustCSS // adjust dialog padding
                isBody={true}
                tag='div'
                attribute='aria-label'
                searchValue='form-submission-status'
                style={{padding: "48px 24px 24px 24px"}}
            />
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
                        className={f.label.replace("_", "-")}
                        data-selector={f.label}
                        placeholder=""
                        label={f.name}
                        items={audioSMPScoring}
                        size='regular'
                        allowReselect
                        error={typeError}
                        disabled={(skipLogic && skipLogic.length > 0) ? skipLogic.find((logic) => logic.field === f.label)?.disabled : false}
                        selectedValue={activeFields.find((field)=> field.label === f.label).value}
                        onChange={(value) => { updateField(f.label, value) }}
                    />
                })}
                <SingleSelect
                    className="disposition"
                    label={"Disposition"}
                    items={dispositionList}
                    size='regular'
                    data-selector="disposition"
                    allowReselect
                    error={typeError}
                    selectedValue={
                        activeFields.find((field)=> field.label === "disposition").value === "" ? watch("disposition") : activeFields.find((field)=> field.label === "disposition").value
                    }
                    onChange={(value) => { updateField("disposition", value=value.toString()) }}
                />
            </Grid>
            <TextArea
                className="form-call-notes"
                size='regular'
                label='Call Notes'
                data-selector='call_notes' 
                value={activeFields.find((field)=> field.label === "call_notes").value === "" ? watch("call_notes") : activeFields.find((field)=> field.label === "call_notes").value}
                onChange={(e) => { updateField("call_notes", e.target.value) }}
            />
            <Divider />
            <SingleSelect
                className="mca-category"
                data-selector='mca_category' 
                label={"MCA Category"}
                items={mcaCategoryList}
                placeholder="Choose MCA Category..."
                initialValue={""}
                size='regular'
                allowReselect
                selectedValue={
                    activeFields.find((field)=> field.label === "mca_category").value === "" ? watch("mca_category") : activeFields.find((field)=> field.label === "mca_category").value
                }
                onChange={(value) => { updateField("mca_category", value=value) }}
            />
            <Flex className='mca-attributes' alignSelf='center' flexDirection='row' gap={aliasTokens.space900} justifySelf='center' flexWrap='wrap'>
                {Object.values(mcaCheckboxes).map(f => (
                    <Checkbox
                        className={f.label.replaceAll("_", "-")}
                        data-selector={f.label} 
                        size='regular' 
                        label={f.name} 
                        checked={activeFields.find((field)=> field.label === f.label).value}
                        onChange={(e, {checked, indeterminate}) => { updateField(f.label, checked) }}
                    />
                ))}
            </Flex>
            <Flex className="mca-call-notes" flexDirection='row' gap={aliasTokens.space700}>
                <TextArea 
                    className="mca-summary-observation" 
                    size='regular' 
                    label='MCA Summary of Observation' 
                    data-selector='mca_summary_observation'
                    value={activeFields.find((field)=> field.label === "mca_summary_observation").value === "" ? watch("mca_summary_observation") : activeFields.find((field)=> field.label === "mca_summary_observation").value}
                    onChange={(e) => { updateField("mca_summary_observation", e.target.value)}}
                />
            </Flex>
            <Divider />
            <FlexWrapperFooterBtnGroup className='form-footer-btns' flexDirection='row' gap={aliasTokens.space300}>
                <Button
                    type='button'
                    variant='danger'
                    size='compact' 
                    view='solid'
                    className='form-btm-delete'
                    roundedCorners='all'
                    icon={{
                        icon: StyledDeleteIcon as FC<IconSvgProps>,
                        iconPosition: 'left'
                    }}
                    disabled={qaForms.forms.length === 1}
                    onClick={deleteCurrentForm}
                >
                    Delete
                </Button>
                <Button
                    type='button'
                    variant='secondary'
                    size='compact' 
                    view='outlined'
                    className='form-btm-save-new'
                    roundedCorners='all'
                    icon={{
                        icon: AddCircleOutlineIcon,
                        iconPosition: 'left'
                    }}
                    onClick={createNewForm}
                >
                    Create New
                </Button>
                <Button
                    type='submit'
                    size='compact' 
                    roundedCorners='all'
                    variant='primary'
                    view='solid'
                    className='form-top-submit'
                    icon={{
                        icon: StyledSubmitIcon as FC<IconSvgProps>,
                        iconPosition: 'right'
                    }}
                    onClick={() => dialog.show('Are you sure you want to submit?', {
                        icon: WarningFillIcon,
                        variant: dialog.variant.warning,
                        message: 'Please review all form details carefully before submitting. Once submitted, you will not be able to make further changes.',
                        buttons: {
                            confirm: {
                                onClick: async () => await onSubmit().then(() => setToSubmit(true)),
                                text: 'Submit'
                            },
                            cancel: {
                                onClick: () => setToSubmit(false),
                                text: 'Cancel'
                            }
                        }
                    })}
                >
                    Save All & Submit
                </Button>
            </FlexWrapperFooterBtnGroup>

            {/* Form submission status popup notification */}
            <FlexFormSubmission className="form-submission-notifier">
                <Dialog
                    aria-label='form-submission-status'
                    buttons={{
                        confirm: {
                            onClick: () => isSuccessful ? exit() : onError(submissionMessage),
                            text: isSuccessful ? 'Close' : "Try Again"
                        }
                    }}
                    // statusChip="SUBMISSION SUCCESS"
                    title={isSuccessful ? 'Forms successfully submitted!' : 'Something Went Wrong.'}
                    variant={isSuccessful ? dialog.variant.success : dialog.variant.danger}
                    opened={toSubmit}
                    icon={isSuccessful ? CheckmarkIcon : ErrorOutlineIcon}
                >
                    {submissionMessage ? `Forms were not saved. ${submissionMessage} Please try again.` : ""}
                </Dialog>
            </FlexFormSubmission>
        </FlexBody>
    )   
}

export default QAFormBody