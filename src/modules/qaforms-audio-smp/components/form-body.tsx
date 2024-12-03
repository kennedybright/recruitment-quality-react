import React from 'react'
import { useFormContext } from '../shared/forms'
import { aliasTokens, useGDSConfig } from '@nielsen-media/maf-fc-foundation'
import { FlexBody, FlexWrapperFooterBtnGroup, StyledDeleteIcon, StyledSubmitIcon } from '../styles'
import Flex from '@nielsen-media/maf-fc-flex' 
import Text from '@nielsen-media/maf-fc-text'
import Checkbox from '@nielsen-media/maf-fc-checkbox'
import TextArea from '@nielsen-media/maf-fc-text-area'
import { SingleSelect } from '@nielsen-media/maf-fc-select'
import Grid from '@nielsen-media/maf-fc-grid'
import Button from '@nielsen-media/maf-fc-button'
import { AddCircleOutlineIcon } from '@nielsen-media/maf-fc-icons'

const QAFormBody: React.FC = () => {

    const { getActiveForm, updateField, deleteCurrentForm, createNewForm, onSubmit, methods, getFields } = useFormContext()
    const { watch } = methods
    const activeForm = getActiveForm()

    const scoringDropdowns = getFields(13, 49).map(field => {
        // Replace dashes and convert string to sentence case
        const name = field.label.replaceAll("-", " ").toLowerCase().replace(/(?:^|\s)\w/g, (match) => match.toUpperCase())
        if (name.includes("Hh")) name.replace("Hh", "HH")
        if (name.includes("Tv")) name.replace("Tv", "TV")
        if (name.includes("Num")) name.replace("Num", "#")
        if (name.includes("Vmvpd")) name.replace("Vmvpd", "vMVPD")
        return { ...field, name: name }
    })

    const mcaCheckboxes = getFields(54, 58).map(field => {
        // Replace dashes and convert string to sentence case
        const name = field.label.replaceAll("-", " ").toLowerCase().replace(/(?:^|\s)\w/g, (match) => match.toUpperCase())
        return { ...field, name: name }
    })

    return (
        <FlexBody className='form-body' flexDirection='row' column gap={aliasTokens.space700}>
            <Flex className='form-body-header-text' column gap={0} flexBasis='68%' >
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
                {Object.values(scoringDropdowns).map(f => (
                    <SingleSelect
                        className={f.label} 
                        label={f.name}
                        items={[ {label: "-1", value: -1}, {label: "0", value: 0}, {label: "1", value: 1} ]}
                        size='regular'
                        allowReselect
                        //required
                        //disabled
                        selectedValue={
                            activeForm.fields.find((field)=> field.label === f.label).value === "" ? watch(f.label) : activeForm.fields.find((field)=> field.label === f.label).value
                        }
                        onChange={(value) => {updateField(f.label, value=value)}}
                    />
                ))}
                <SingleSelect
                    className="disposition"
                    label={"Disposition"}
                    items={[ {label: "Correct", value: "Correct"}, {label: "Incorrect", value: "Incorrect"} ]}
                    size='regular'
                    allowReselect
                    required
                    //disabled
                    selectedValue={
                        activeForm.fields.find((field)=> field.label === "disposition").value === "" ? watch("disposition") : activeForm.fields.find((field)=> field.label === "disposition").value
                    }
                    onChange={(value) => {updateField("disposition", value=value)}}
                />
            </Grid>
            <TextArea
                className="form-comments"
                size='regular'
                label='Comments'
                data-selector='comments' 
                maxLength={500}
                value={activeForm.fields.find((field)=> field.label === "comments").value === "" ? watch("comments") : activeForm.fields.find((field)=> field.label === "comments").value}
                onChange={(e) => { updateField("comments", e.target.value)}}
            />
            <hr className="solid" color={aliasTokens.color.neutral200}></hr>
            <SingleSelect
                className="mca-category"
                label={"MCA Category"}
                items={[ 
                    {label: "Data Falsification", value: "Data Falsification"}, 
                    {label: "Production Process Alert", value: "Production Process Alert"},
                    {label: "Refusal Miscode", value: "Refusal Miscode"}
                ]}
                size='regular'
                allowReselect
                selectedValue={
                    activeForm.fields.find((field)=> field.label === "mca-category").value === "" ? watch("mca-category") : activeForm.fields.find((field)=> field.label === "mca-category").value
                }
                onChange={(value) => { updateField("mca-category", value=value)}}
            />
            <Flex className='mca-attributes' alignSelf='center' flexDirection='row' gap={aliasTokens.space900}>
                {Object.values(mcaCheckboxes).map(f => (
                    <Checkbox
                        size='regular' 
                        label={f.name} 
                        checked={activeForm.fields.find((field)=> field.label === f.label).value}
                        onChange={(e, {checked, indeterminate}) => {updateField(f.label, checked)}}
                    />
                ))}
            </Flex>
            <Flex className="mca-comments-area" flexDirection='row' gap={aliasTokens.space700}>
                <TextArea 
                    className="mca-comments" 
                    size='regular' 
                    label='MCA Comments' 
                    data-selector='mca-comments' 
                    maxLength={500}
                    value={activeForm.fields.find((field)=> field.label === "mca-category-comments").value === "" ? watch("mca-category-comments") : activeForm.fields.find((field)=> field.label === "mca-category-comments").value}
                    onChange={(e) => { updateField("mca-category-comments", e.target.value)}}
                />
                <TextArea 
                    className="mca-summary-observation" 
                    size='regular' 
                    label='MCA Summary of Observation' 
                    data-selector='mca-summary-observation' 
                    maxLength={500}
                    value={activeForm.fields.find((field)=> field.label === "mca-summary-observation").value === "" ? watch("mca-summary-observation") : activeForm.fields.find((field)=> field.label === "mca-summary-observation").value}
                    onChange={(e) => { updateField("mca-summary-observation", e.target.value)}}
                />
            </Flex>
            <FlexWrapperFooterBtnGroup id='form-footer-btns' flexDirection='row' gap={aliasTokens.space300}>
                <Button
                type='button'
                variant='danger'
                size='compact' 
                view='solid'
                aria-label='form-btm-delete'
                roundedCorners='all'
                icon={{
                    icon: StyledDeleteIcon,
                    iconPosition: 'left'
                }}
                disabled={getActiveForm().formID === 1 ? true : false}
                //onClick={() => deleteCurrentForm}
                >
                Delete
                </Button>
                <Button
                type='button'
                variant='secondary'
                size='compact'  
                view='outlined'
                aria-label='form-btm-save-new'
                roundedCorners='all'
                icon={{
                    icon: AddCircleOutlineIcon,
                    iconPosition: 'left'
                }}
                //onClick={() => createNewForm}
                >
                Save & Create New
                </Button>
                <Button
                type='submit'
                size='compact'
                roundedCorners='all'
                variant='primary'
                view='solid'
                aria-label='form-top-submit'
                icon={{
                    icon: StyledSubmitIcon,
                    iconPosition: 'right'
                }}
                //onClick={() => onSubmit}
                >
                Save All & Submit
                </Button>
            </FlexWrapperFooterBtnGroup>
        </FlexBody>
    )   
}

export default QAFormBody