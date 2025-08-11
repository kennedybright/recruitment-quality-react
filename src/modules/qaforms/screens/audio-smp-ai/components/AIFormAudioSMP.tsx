import { FC } from 'react'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FlexFormBody, FlexFormDetails, FlexFormTop } from '../../../styles'
import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import AdjustCSS from '../../../../../lib/utils/adjustCSS'
import { AudioSMPAttributeGroup, AudioSMPFormCheckboxGroup, AudioSMPMCACheckboxGroup, AudioSMPToggleButton, MCAScoringSelect } from '../../audio-smp/components'
import { FormTopHeader, CurrentFormMetaData, AIFormChangesCounter, FormPagination, FormBodyHeader, FormTextArea, AIFormActionsButtonGroup, FormErrorCounter } from '../../../components'
import { Divider, FlexWrapper400800 } from '../../../../../lib/shared.styles'
import { AudioSMPFormProps } from '../../audio-smp/components/FormAudioSMP'
import { useAIFormContext } from '../../../../../modules/qaforms/base/formAI.context'
import { EmptyQAFormState, AIFormFiltersGroup, AIAudioSMPScoringGroup } from '../components'
import Spinner from '@nielsen-media/maf-fc-spinner'

const AIAudioSMPQAForm: FC<AudioSMPFormProps> = ({ mode, formID, readonlyData }) => {
    const dataStatus = () => {
        switch(mode) {
            case 'ai': {
                const { queryStatus } = useAIFormContext()
                return queryStatus
            }

            case 'readonly': {
                return 'success'
            }
        }
    }
    const formState = dataStatus()
    
    return (
        <FlexWrapper400800 column gap={aliasTokens.space450} className='qa-monitoring-form' id='ai-audio-smp-form'>
            <AdjustCSS // adjust the sticky filters positioning
                tag='div'
                attribute='data-selector'
                searchValue='maf-fc-sticky-header-filters'
                targetSelector=":scope > *:first-child"
                style={{position: "static"}}
            />

            {mode === 'ai' && <AIFormFiltersGroup />}

            {formState === 'idle' && <EmptyQAFormState title="Enter Filters to Load Forms" description="No monitoring forms have been displayed yet. In order to begin monitoring, simply run a query using parameters above." />}
            {formState === 'no-data' && <EmptyQAFormState title="No Forms Loaded" description="No monitoring forms match the current criteria. Please try again." />}
            {formState === 'loading' && <Spinner className='ai-data-query-loading' loading />}
            {formState === 'error' && <EmptyQAFormState title="Error Occured" error description="An error occured when fetching the data. Please try again." />}

            {formState === 'success' && (
                <Flex className='ai-form' column gap={aliasTokens.space450}>
                    <FlexFormTop className="form-top" column gap={aliasTokens.space500}>
                        {mode !== 'ai' && <FormTopHeader mode={mode} formID={formID} />}

                        <Flex flexDirection={mode === 'ai' ? 'row': 'column'} flexFlow={mode !== 'ai' ? 'inherit': undefined} gap={aliasTokens.space700} justifyContent='center'>
                            <FlexFormDetails className='current-form' column gap={aliasTokens.space600} alignItems={mode !== 'ai' ? 'center' : undefined}>
                                <Flex className='current-form__header' flexDirection='row' gap={aliasTokens.space500} alignItems='center' justifyContent='space-between'>
                                    {mode === 'ai' && (
                                        <Text className='current-form__title' externalAs='h3' fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold}>
                                            Current Form Details
                                        </Text>
                                    )}
                                    <AudioSMPToggleButton mode={mode} readonlyData={readonlyData} />
                                </Flex>

                                <Flex className='current form details' column gap={aliasTokens.space700} alignItems={mode !== 'ai' ? 'center' : undefined}>
                                    <CurrentFormMetaData mode={mode} readonlyData={readonlyData} />
                                    <AudioSMPAttributeGroup mode={mode} readonlyData={readonlyData} />
                                    <AudioSMPFormCheckboxGroup mode={mode} readonlyData={readonlyData} />
                                </Flex>
                            </FlexFormDetails>

                            
                            {mode === 'ai' && (
                                <Flex column>
                                    <FormErrorCounter mode={mode} />
                                    <AIFormChangesCounter />
                                </Flex>
                            )}
                        </Flex>

                        {mode === 'ai' && <FormPagination mode={mode} />}
                    </FlexFormTop>

                    <FlexFormBody className='form-body' flexDirection='row' column gap={aliasTokens.space700}>
                        <AdjustCSS // adjust dialog padding
                            tag='div'
                            attribute='aria-label'
                            searchValue='form-submission-status'
                            style={{padding: "48px 24px 24px 24px"}}
                        />

                        <FormBodyHeader />
                        
                        <AIAudioSMPScoringGroup mode={mode} readonlyData={readonlyData} />
                        <FormTextArea mode={mode} label='call_notes' title='Call Notes' readonlyData={readonlyData} />
                        
                        <Divider />
                        
                        <MCAScoringSelect mode={mode} readonlyData={readonlyData} />
                        <AudioSMPMCACheckboxGroup mode={mode} readonlyData={readonlyData} />
                        <Flex className="mca-call-notes" flexDirection='row' gap={aliasTokens.space700}>
                            <FormTextArea mode={mode} label='mca_summary_observation' title='MCA Summary of Observation' readonlyData={readonlyData} />
                        </Flex>
                        
                        {mode === 'ai' && (
                            <Flex column>
                                <Divider />
                                <AIFormActionsButtonGroup />
                            </Flex>
                        )}
                    </FlexFormBody>
                </Flex>
            )}
        </FlexWrapper400800>
    )
}

export default AIAudioSMPQAForm