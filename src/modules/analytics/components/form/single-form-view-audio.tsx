import { FC } from 'react'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FlexWrapper, StyledInputField } from '../../../qaforms/qaforms-audio-smp/styles'
import Flex from '@nielsen-media/maf-fc-flex'
import { UserCircleFillIcon } from '@nielsen-media/maf-fc-icons' 
import Text from '@nielsen-media/maf-fc-text'
import List from '@nielsen-media/maf-fc-list'
import Checkbox from '@nielsen-media/maf-fc-checkbox'
import { getFieldsbyRange } from '../../../../lib/utils/qa-forms'
import TextArea from '@nielsen-media/maf-fc-text-area'
import Grid from '@nielsen-media/maf-fc-grid'
import HookFormInput from '@nielsen-media/maf-fc-input'
import { FlexBody, FlexFormDetails, FlexWrapperHeaderText } from '../../operations/styles'
import { formatDateTime } from '../../../../lib/utils/shared'
import { TableData } from '@nielsen-media/maf-fc-table2'
import { useDataContext } from '../../../../lib/context/static-data'
import { Divider } from '../../../../lib/global/styles'

interface QAFormProps { form: TableData }

const QAFormSingleView: FC<QAFormProps> = ({form}) => {
    const { audioFormFields } = useDataContext()

    const scoringDropdowns = getFieldsbyRange(audioFormFields, 19, 56).map(field => {
        // Replace dashes and convert string to title case
        if (field.name.includes("Hh")) return { ...field, name: field.name.replace("Hh", "HH") }
        if (field.name.includes("Tv")) return { ...field, name: field.name.replace("Tv", "TV") }
        if (field.name.includes("mvpd")) return { ...field, name: field.name.replace("Vmvpd", "vMVPD") }
        return field
    })

    const qaCheckboxes = getFieldsbyRange(audioFormFields, 13, 16)
    const mcaCheckboxes = getFieldsbyRange(audioFormFields, 61, 65)

    const { formattedDate, formattedTime } = formatDateTime(new Date(`${form.record_date}T${form.record_time}`))

    return (
        <FlexWrapper column gap={aliasTokens.space450} className='single-qa-form-view'>
            <FlexWrapperHeaderText className='current-form--header' gap={aliasTokens.space350}>
                <Text className='current-form-title' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold}>
                    Record Number:
                </Text>
                <Text className='current-form-number' data-selector='record_number' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold} color={aliasTokens.color.primary600}>
                    {form.record_number}
                </Text>
            </FlexWrapperHeaderText>
            <FlexFormDetails className='current-form-details' column gap={aliasTokens.space600}>
                <Flex className="details" column gap={aliasTokens.space700} alignItems='center'>
                    <List className="details-current-form-metadata" size='regular' groupDirection='row' hasDivider>
                        <List.Item className='record-date' data-selector='record_date' body={formattedDate} heading={"Record Date"} />
                        <List.Item className='record-time' data-selector='record_time' body={formattedTime} heading={"Record Time"} />
                        <List.Item className='qr-id' data-selector='qr-id' body={form.qr_id} heading={"QR ID"} icon={UserCircleFillIcon} />
                    </List>
                    <Flex className="details-current-form-attributes" flexDirection='row' gap={aliasTokens.space700} flexWrap='wrap'>
                        <StyledInputField
                            className='ri-id'
                            size='compact'
                            label="RI ID"
                            data-selector='ri_id'
                            layout="vertical"
                            value={form.ri_id}
                            readOnly
                        />
                        <StyledInputField
                            className='ri-shift'
                            size='compact'
                            label="RI Shift"
                            data-selector='ri_shift'
                            layout="vertical"
                            value={form.ri_shift}
                            readOnly
                        />
                        <StyledInputField
                            className='site-name'
                            size='compact'
                            label="RI Site Name"
                            data-selector='site_name_id'
                            layout="vertical"
                            value={form.site_name_id}
                            readOnly
                        />
                        <StyledInputField
                            className='sample-id'
                            label="Sample ID"
                            value={form.sample_id}
                            size='compact'
                            layout='vertical'
                            data-selector='sample_id'
                            readOnly
                        />
                        <StyledInputField
                            className='call-type'
                            size='compact'
                            label="Call Type"
                            data-selector='call_type_id'
                            layout="vertical"
                            value={form.call_type_id}
                            readOnly
                        />
                        <StyledInputField
                            className='frame-code'
                            size='compact'
                            label="Frame Code"
                            data-selector='frame_code_id'
                            layout="vertical"
                            value={form.frame_code_id}
                            readOnly
                        />
                        <StyledInputField
                            className='call-direction'
                            size='compact'
                            label="Call Direction"
                            data-selector='call_direction'
                            layout="vertical"
                            value={form.call_direction}
                            readOnly
                        />
                    </Flex>
                    <Flex className="details-current-form-call-attributes" alignSelf='center' flexDirection='row' gap={aliasTokens.space850}
                    >
                        {Object.values(qaCheckboxes).map(f => (
                            <Checkbox 
                                className={f.label.replaceAll("_", "-")}
                                size='regular' 
                                data-selector={f.label}
                                label={f.name}
                                checked={form[f.label]}
                            />
                        ))}
                    </Flex>
                </Flex>
            </FlexFormDetails>
            <FlexBody className='current-form-body' flexDirection='row' column gap={aliasTokens.space700}>
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
                    return <HookFormInput
                        className={f.label.replaceAll("_", "-")}
                        label={f.name}
                        size='regular'
                        disabled={form[f.label] === null}
                        value={form[f.label]}
                        layout='vertical'
                        data-selector={f.label}
                        readOnly
                    />
                })}
                <HookFormInput
                    className="disposition"
                    label={"Disposition"}
                    size='regular'
                    value={form.disposition}
                    layout='vertical'
                    data-selector='disposition'
                    readOnly
                />
            </Grid>
            <TextArea
                className="form-call-notes"
                size='regular'
                label='Call Notes'
                data-selector='call_notes'
                value={form.call_notes}
                readOnly
            />
            <Divider />
            <HookFormInput
                className="mca-category"
                label={"MCA Category"}
                size='regular'
                layout='vertical'
                value={form.mca_category}
                data-selector="mca_category"
                readOnly
            />
            <Flex className='mca-attributes' alignSelf='center' flexDirection='row' gap={aliasTokens.space900} justifySelf='center' flexWrap='wrap'>
                {Object.values(mcaCheckboxes).map(f => (
                    <Checkbox
                        className={f.label.replaceAll("_", "-")}
                        size='regular' 
                        data-selector={f.label}
                        label={f.name} 
                        checked={form[f.label]}
                    />
                ))}
            </Flex>
            <Flex className="mca-call-notes" flexDirection='row' gap={aliasTokens.space700}>
                <TextArea 
                    className="mca-summary-observation" 
                    size='regular' 
                    label='MCA Summary of Observation' 
                    data-selector='mca_summary_observation'
                    value={form.mca_summary_observation}
                    readOnly
                />
            </Flex>
            </FlexBody>
        </FlexWrapper>
    )
}

export default QAFormSingleView