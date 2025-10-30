import { HookForm, aliasTokens } from "@nielsen-media/maf-fc-foundation"
import { FC } from "react"
import { useFormContext } from "../base/form.context"
import Button from "@nielsen-media/maf-fc-button"
import { useMAFContext } from "../../../maf-api"
import { AddCircleOutlineIcon, CheckDashIcon, CheckmarkIcon, ErrorOutlineIcon, WarningFillIcon } from "@nielsen-media/maf-fc-icons"
import Dialog from "@nielsen-media/maf-fc-dialog"
import ProgressBar from '@nielsen-media/maf-fc-progress-bar'
import Flex from "@nielsen-media/maf-fc-flex"
import Text from "@nielsen-media/maf-fc-text"
import { FlexFormSubmission, FlexWrapperFooterBtnGroup, StyledDeleteIcon, StyledSubmitIcon } from "../styles"

export interface FormActionsGroupProps {
    hookform?: HookForm
}

export const FormActionsButtonGroup: FC<FormActionsGroupProps> = ({ hookform }) => {
    const { notifier: { dialog } } = useMAFContext()
    const { qaForms, formErrors, deleteCurrentForm, createNewForm, toSubmit, isSubmitting, submitProgress, 
        isSuccessful, submissionMessage, onSubmit, exit, cancelSubmission } = useFormContext()

    return (
        <FlexWrapperFooterBtnGroup className='form-footer-btns' flexDirection='row' gap={aliasTokens.space300}>
            <Button
                type='button'
                variant='danger'
                size='compact' 
                view='outlined'
                className='form-button__delete'
                roundedCorners='all'
                icon={{
                    icon: StyledDeleteIcon,
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
                className='form-button__create-new'
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
                className='form-button__submit'
                disabled={formErrors.length > 0}
                icon={{
                    icon: StyledSubmitIcon,
                    iconPosition: 'right'
                }}
                onClick={() => dialog.show('Are you sure you want to submit?', {
                    icon: WarningFillIcon,
                    variant: dialog.variant.warning,
                    message: 'Please review all form details carefully before submitting. Once submitted, you will not be able to make further changes.',
                    buttons: {
                        confirm: {
                            onClick: async () => await onSubmit(),
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
                    title={isSubmitting ? "Submitting All Forms..." : isSuccessful === true ? 'Forms successfully submitted!' : 'Something Went Wrong.'}
                    variant={isSubmitting ? dialog.variant.neutralTertiary : isSuccessful === true ? dialog.variant.success : dialog.variant.danger}
                    opened={toSubmit}
                    icon={isSubmitting ? CheckDashIcon : isSuccessful ? CheckmarkIcon : ErrorOutlineIcon}
                >
                    <Text fontSize="s300" color={isSuccessful === false ? aliasTokens.color.danger500 : aliasTokens.color.primary500} fontWeight="bold">
                        <Flex flexDirection='row' gap={aliasTokens.space300} justifySelf='center' alignItems="center"> 
                            <ProgressBar
                                className='progress-bar'
                                aria-label="form submission"
                                size="compact"
                                value={submitProgress * (100/qaForms.forms.length)}
                                hasError={isSuccessful === false}
                                width='140px'
                                max={100}
                            />
                            {qaForms.forms.length === 0 ? 0 : Math.round(submitProgress * (100/qaForms.forms.length))}% 
                        </Flex>
                    </Text>
                    <Text textAlign="center">{submissionMessage}</Text>
                </Dialog>
            </FlexFormSubmission>
        </FlexWrapperFooterBtnGroup>
    )
}