import { HookForm, aliasTokens } from "@nielsen-media/maf-fc-foundation"
import { FC } from "react"
import { useAIFormContext } from "../base/formAI.context"
import Button from "@nielsen-media/maf-fc-button"
import { useMAFContext } from "../../../maf-api"
import { CheckDashIcon, CheckmarkIcon, ErrorOutlineIcon, ResetIcon, WarningFillIcon } from "@nielsen-media/maf-fc-icons"
import Dialog from "@nielsen-media/maf-fc-dialog"
import { FlexFormSubmission, StyledSubmitIcon, FlexWrapperFooterBtnGroup } from "../styles"
import ProgressBar from '@nielsen-media/maf-fc-progress-bar'
import Flex from "@nielsen-media/maf-fc-flex"
import Text from "@nielsen-media/maf-fc-text"
import { FormActionsGroupProps } from "./FormActionsButtonGroup"

export const AIFormActionsButtonGroup: FC<FormActionsGroupProps> = ({ hookform }) => {
    const { notifier: { dialog } } = useMAFContext()
    const { activeForm, formErrors, toSubmit, isSubmitting, submitProgress, formChanges, clearAllEdits, totalSubmission,
        isSuccessful, submissionMessage, submitActionMessage, onSubmitAll, onSubmitCurrent, exit, cancelSubmission } = useAIFormContext()

    return (
        <FlexWrapperFooterBtnGroup className='form-footer-btns' flexDirection='row' gap={aliasTokens.space300}>
            <Button 
                className='ai edit button__reset'
                type='button'
                variant='tertiary'
                size='compact'  
                view='outlined'
                aria-label='ai edit reset all changes'
                roundedCorners='all'
                disabled={formChanges.length === 0}
                icon={{
                    icon: ResetIcon,
                    iconPosition: 'left'
                }}
                onClick={clearAllEdits}
            >
                Reset All Changes
            </Button>
            <Button
                type='button'
                size='compact' 
                roundedCorners='all'
                variant='secondary'
                view='solid'
                className='form-button__submitCurrent'
                icon={{
                    icon: CheckmarkIcon,
                    iconPosition: 'left'
                }}
                disabled={
                    formErrors.filter(error => error.formID === activeForm.formRef.ai_record_number)?.length > 0 
                    && formChanges.filter(change => change.form_id === activeForm.formRef.ai_record_number)?.length === 0
                }
                onClick={() => dialog.show('Are you sure you want to submit?', {
                    icon: WarningFillIcon,
                    variant: dialog.variant.warning,
                    message: 'Please review the form details carefully before submitting. Once submitted, you will not be able to make further changes.',
                    buttons: {
                        confirm: {
                            onClick: async () => await onSubmitCurrent(),
                            text: 'Submit'
                        }
                    }
                })}
            >
                Save Current Form
            </Button>
            <Button
                type='button'
                size='compact' 
                roundedCorners='all'
                variant='primary'
                view='solid'
                className='form-button__submitAll'
                icon={{
                    icon: StyledSubmitIcon,
                    iconPosition: 'right'
                }}
                disabled={formErrors.length > 0 && formChanges.length === 0}
                onClick={() => dialog.show('Are you sure you want to submit?', {
                    icon: WarningFillIcon,
                    variant: dialog.variant.warning,
                    message: 'Please review all form details carefully before submitting. Once submitted, you will not be able to make further changes.',
                    buttons: {
                        confirm: {
                            onClick: async () => await onSubmitAll(),
                            text: 'Submit'
                        }
                    }
                })}
            >
                Save All & Submit
            </Button>

            {/* Form submission status popup notification */}
            <FlexFormSubmission className="form-submission-notifier">
                <Dialog
                    aria-label='form-submission-status'
                    buttons={{
                        confirm: {
                            onClick: () => isSuccessful === true ? exit() : cancelSubmission(),
                            text: isSubmitting ? "Cancel" : isSuccessful === true ? 'Close' : "Try Again"
                        }
                    }}
                    statusChip={isSubmitting ? "IN PROGRESS" : isSuccessful === true ? "SUCCESS" : "FAILED"}
                    title={isSubmitting ? "Submitting Now..." : isSuccessful === true ? 'Successfully submitted!' : 'Something Went Wrong.'}
                    variant={isSubmitting ? dialog.variant.neutralTertiary : isSuccessful === true ? dialog.variant.success : dialog.variant.danger}
                    opened={toSubmit}
                    size='jumbo'
                    icon={isSubmitting ? CheckDashIcon : isSuccessful ? CheckmarkIcon : ErrorOutlineIcon}
                >
                    <Flex column gap={aliasTokens.space100}>
                        <Text fontSize="s300" color={(!isSubmitting && isSuccessful === false) ? aliasTokens.color.danger500 : aliasTokens.color.primary500} fontWeight="bold">
                            <Flex flexDirection='row' gap={aliasTokens.space300} alignItems='center'> 
                                <ProgressBar
                                    className='progress-bar'
                                    aria-label="form submission"
                                    size="compact"
                                    value={submitProgress * (100/totalSubmission)}
                                    hasError={!isSubmitting && isSuccessful === false}
                                    width='250px'
                                    max={100}
                                />
                                {totalSubmission === 0 ? 0 : Math.round(submitProgress * (100/totalSubmission))}%
                            </Flex>
                        </Text>
                        {isSubmitting && <Text fontSize='s400' textAlign='left'>{submitActionMessage}</Text>}
                    </Flex>
                    <Text textAlign="center">{submissionMessage}</Text>
                </Dialog>
            </FlexFormSubmission>
        </FlexWrapperFooterBtnGroup>
    )
}