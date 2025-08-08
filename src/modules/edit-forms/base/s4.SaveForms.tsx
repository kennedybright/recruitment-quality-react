import { useEffect } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import { useEditContext } from './edit.context'
import { FlexMessageStatus } from '../../generate-report/styles'
import DisplayIcon, { DisplayIconSize } from '@nielsen-media/maf-fc-display-icon'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { CheckmarkIcon, ErrorOutlineIcon } from '@nielsen-media/maf-fc-icons'
import { FlexWrapper400800 } from '../../../lib/shared.styles'
import Flex from '@nielsen-media/maf-fc-flex'
import ProgressBar from '@nielsen-media/maf-fc-progress-bar'
import { buildEditsSubmission } from '../../../lib/utils/qa/editQA'
import { InlineSpinner } from '@nielsen-media/maf-fc-spinner'
import Button from '@nielsen-media/maf-fc-button'

const SaveForms = () => {
    const { qr, editMode, form, forms, formChanges, auditTracking, isSaving, submitActionMessage, saveSubmitProgress, saveForms, 
        deleteFormIDs, submitTransactions, isSuccessful, setIsSuccessful, submissionMessage, exit } = useEditContext()

    const totalSubmission = editMode === "single" ? (1 + formChanges.length) : (forms.length + formChanges.length)
    
    useEffect(() => { // Save and submit form edits to database
        const { finalForms, finalDeletions, finalChanges } = buildEditsSubmission(qr, 1001, editMode, editMode === "single" ? form : forms, formChanges, auditTracking)

        const updateForms = async () => {
            const savedIDs = finalForms.length > 0 ? await saveForms(finalForms) : []
            const deletedIDs = finalDeletions.length > 0 ? await deleteFormIDs(finalDeletions) : []
            return { savedIDs, deletedIDs }
        }
        
        updateForms().then((results) => {
            console.log("results", results)
            const finalFilteredChanges = finalChanges.filter(change => 
                (results.savedIDs.includes(change.record_number) && change.new_value !== "FORM DELETED") || 
                (results.deletedIDs.includes(change.record_number) && change.new_value === "FORM DELETED"))

            const totalSuccessful = results.savedIDs.length + results.deletedIDs.length
            if (totalSubmission === totalSuccessful) {
                console.log("All updates have been successful. Submitting all edit transactions...")
                setIsSuccessful(true)
            } else {
                const totalFailedSaved = finalForms?.filter((form: any) => !results.savedIDs.includes(form.record_number))
                const totalFailedDeleted = finalDeletions?.filter((id) => !results.deletedIDs.includes(id))
                console.log("Some updates have failed:", totalFailedSaved, totalFailedDeleted)
                setIsSuccessful(false)
            }
            submitTransactions(finalFilteredChanges)
        })
    }, [])

    return (
        <FlexWrapper400800 className='save-forms' column gap={aliasTokens.space500}>            
            <FlexMessageStatus column>
                {isSaving && <InlineSpinner aria-label="loading-save-forms" loading />}
                {(!isSaving && isSuccessful !== null) && (
                    <Flex column gap={aliasTokens.space300} alignItems='center'>
                        <DisplayIcon
                            icon={isSuccessful ? CheckmarkIcon : ErrorOutlineIcon}
                            size={DisplayIconSize.s700}
                            variant={isSuccessful ? 'success' : 'danger'}
                        />
                        <Text className="save-result-status" fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold}>
                            {isSuccessful
                                ? "Form(s) has been successfully saved."
                                : "Form(s) and its form changes were not successfully saved. Please go back and try again."
                            }
                        </Text>
                    </Flex>
                )}
                
                <Flex column gap={aliasTokens.space100}>
                    <Text fontSize="s300" color={(!isSaving && isSuccessful === false) ? aliasTokens.color.danger500 : aliasTokens.color.primary500} fontWeight="bold">
                        <Flex flexDirection='row' gap={aliasTokens.space300} alignItems='center'> 
                            <ProgressBar
                                className='progress-bar'
                                aria-label="form submission"
                                size="compact"
                                value={saveSubmitProgress * (100/totalSubmission)}
                                hasError={!isSaving && isSuccessful === false}
                                width='250px'
                                max={100}
                            />
                            {totalSubmission === 0 ? 0 : Math.round(saveSubmitProgress * (100/totalSubmission))}%
                        </Flex>
                    </Text>
                    {isSaving && <Text fontSize='s400' textAlign='left'>{submitActionMessage}</Text>}
                </Flex>

                <Text className="save-status-message" textAlign="center">{submissionMessage}</Text>

                {(!isSaving && isSuccessful === true) && (
                    <Button
                        className='btn-edit-start-over'
                        size="compact"
                        variant='tertiary'
                        autoFocus
                        onClick={exit}
                        type='reset'
                    >
                        Start Over & Edit New Form(s)
                    </Button>
                )} 
            </FlexMessageStatus>
        </FlexWrapper400800>
    )
}

export default SaveForms