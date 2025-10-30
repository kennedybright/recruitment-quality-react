import { FC } from 'react'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FlexFormBody, FlexFormDetails, FlexFormTop } from '../../../styles'
import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import AdjustCSS from '../../../../../lib/utils/adjustCSS'
import { FormMode } from '../../../../../lib/types/forms.types'
import { AudioSMPAttributeGroup, AudioSMPFormCheckboxGroup, AudioSMPMCACheckboxGroup, AudioSMPScoringGroup, AudioSMPToggleButton, MCAScoringSelect } from '../components'
import { FormTopHeader, CurrentFormMetaData, FormErrorCounter, FormCallCounter, FormPagination, FormBodyHeader, FormTextArea, FormActionsButtonGroup } from '../../../../qaforms/components'
import { Divider, FlexWrapper400800 } from '../../../../../lib/shared.styles'
import { TableData } from '@nielsen-media/maf-fc-table2'
import { useFormData } from '../../../../../lib/maf-api/hooks/report.hooks'
import Spinner from '@nielsen-media/maf-fc-spinner'
import { ErrorPage } from '../../../../../lib/components/feedback/Error'

export interface AudioSMPFormProps {
    mode: FormMode
    formID?: number
    readonlyData?: TableData
}

const AudioSMPQAForm: FC<AudioSMPFormProps> = ({ mode, formID, readonlyData }) => {
    return (
        <FlexWrapper400800 column gap={aliasTokens.space450} className='qa-monitoring-form' id='audio-smp-form'>
            <FlexFormTop className="form-top" column gap={aliasTokens.space500}>
                {mode !== 'new' && <FormTopHeader mode={mode} formID={formID} />}

                <Flex flexDirection={mode === 'new' ? 'row': 'column'} flexFlow={mode !== 'new' ? 'inherit': undefined} gap={aliasTokens.space700} justifyContent='center'>
                    <FlexFormDetails className='current-form' column gap={aliasTokens.space600} alignItems={mode !== 'new' ? 'center' : undefined}>
                        <Flex className='current-form__header' flexDirection='row' gap={aliasTokens.space500} alignItems='center' justifyContent='space-between'>
                            {mode === 'new' && (
                                <Text className='current-form__title' externalAs='h3' fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold}>
                                    Current Form Details
                                </Text>
                            )}
                            <AudioSMPToggleButton mode={mode} readonlyData={readonlyData} />
                        </Flex>

                        <Flex className='current form details' column gap={aliasTokens.space700} alignItems={mode !== 'new' ? 'center' : undefined}>
                            <CurrentFormMetaData mode={mode} readonlyData={readonlyData} />
                            <AudioSMPAttributeGroup mode={mode} readonlyData={readonlyData} />
                            <AudioSMPFormCheckboxGroup mode={mode} readonlyData={readonlyData} />
                        </Flex>
                    </FlexFormDetails>

                    {mode === 'new' && (
                        <Flex column>
                            <FormErrorCounter mode={mode} />
                            <FormCallCounter />
                        </Flex>
                    )}
                </Flex>

                {mode === 'new' && <FormPagination mode={mode} />}
            </FlexFormTop>
            <FlexFormBody className='form-body' flexDirection='row' column gap={aliasTokens.space700}>
                <AdjustCSS // adjust dialog padding
                    tag='div'
                    attribute='aria-label'
                    searchValue='form-submission-status'
                    style={{padding: "48px 24px 24px 24px"}}
                />

                <FormBodyHeader />
                
                <AudioSMPScoringGroup mode={mode} enableSkipLogic={mode === 'new'} readonlyData={readonlyData} />
                <FormTextArea mode={mode} label='call_notes' title='Call Notes' readonlyData={readonlyData} />
                
                <Divider />
                
                <MCAScoringSelect mode={mode} readonlyData={readonlyData} />
                <AudioSMPMCACheckboxGroup mode={mode} readonlyData={readonlyData} />
                <Flex className="mca-call-notes" flexDirection='row' gap={aliasTokens.space700}>
                    <FormTextArea mode={mode} label='mca_summary_observation' title='MCA Summary of Observation' readonlyData={readonlyData} />
                </Flex>
                
                {mode === 'new' && (
                    <Flex column>
                        <Divider />
                        <FormActionsButtonGroup />
                    </Flex>
                )}
            </FlexFormBody>
        </FlexWrapper400800>
    )
}

export default AudioSMPQAForm