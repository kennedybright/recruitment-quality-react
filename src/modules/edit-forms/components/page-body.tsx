import { FC, useState } from 'react'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { useMAFContext } from '../../../maf-api'
import Flex from '@nielsen-media/maf-fc-flex'
import { useEditContext } from '../edits/edits'
import Button from '@nielsen-media/maf-fc-button'
import Stepper from '@nielsen-media/maf-fc-stepper'
import { FlexBodyWrapper } from '../styles'
import ChooseMethod from './choose-method'
import EditForms from './edit-forms'
import ReviewChanges from './review-changes'
import SaveForms from './save-forms'
import { WarningFillIcon } from '@nielsen-media/maf-fc-icons'

// Add logic to disable go back after last step is successful

const EditFormsBody: FC = () => {
    const { 
        actions: { navigate },
        notifier: { dialog } 
    } = useMAFContext()
    const { editMode, reset, filterError, formChanges, auditTracking, recordNumber, recordDate, riID, isRendering, isSuccessful } = useEditContext()

    // Load the steps based on the edit mode
    const [step, setStep] = useState<number>(0)
    const steps = ["Choose Method", "Edit Form(s)", "Review Changes", "Save Form(s)"]

    // Go to next step
    const next = () => {
        if (step !== 2) {
            setStep((prevStep) => prevStep + 1)
            navigate({ appState: { mode: `${editMode}Edit`, step: steps[step+1] } })
        } else {
            dialog.show('Are you sure you want to submit?', {
                icon: WarningFillIcon,
                variant: dialog.variant.warning,
                message: 'Please review all form changes carefully before submitting. Once submitted, you will not be able to make any further changes.',
                buttons: {
                    confirm: {
                      onClick: () => {
                        setStep((prevStep) => prevStep + 1)
                        navigate({ appState: { mode: `${editMode}Edit`, step: steps[step+1] } })
                      },
                      text: 'Submit'
                    },
                    cancel: {
                        text: 'Cancel'
                    }
                }
            })
        }
    }

    // Go to previous step
    const prev = () => { 
        setStep((prevStep) => prevStep - 1)
        if (step-1 === 0) {
            reset()
            navigate({ appState: { step: steps[step-1] } })
        }
        navigate({ appState: { mode: `${editMode}Edit`, step: steps[step-1] } })
    }

    return (
        <Flex className='page-body' column>
            <FlexBodyWrapper className='body-grid' column gap={aliasTokens.space500}>
                {step === 0 && <ChooseMethod />}
                {step === 1 && <EditForms />}
                {step === 2 && <ReviewChanges />}
                {step === 3 && <SaveForms />}
            </FlexBodyWrapper>
            <Flex column className='page-stepper'>
                    <Stepper
                        direction="horizontal"
                        linear
                        onChange={((stepNumber) => { setStep(stepNumber) })}
                        selectedIndex={step}
                        steps={[
                            {
                                completed: (step > 0) ? true : false,
                                title: 'Choose Method',
                                required: true,
                                error: filterError
                            },
                            {
                                completed: (step > 1) ? true : false,
                                title: 'Edit Form(s)',
                                error: !isRendering
                            },
                            {
                                completed: (step > 2) ? true : false,
                                title: 'Review Changes',
                            },
                            {
                                completed: (step === 3 && isSuccessful === true) ? true : false,
                                title: 'Save Form(s)',
                                error: isSuccessful === false
                            }
                        ]}
                    />
                    <Flex className="stepper-btns" flexDirection='row' gap={aliasTokens.space400} justifyContent="center">
                        <Button 
                            className='btn-back' 
                            onClick={prev} 
                            size="tiny" 
                            disabled={step === 0 || (step === 3 && isSuccessful)}
                        >
                            Go Back
                        </Button>
                        <Button 
                            className='btn-next' 
                            onClick={next} 
                            size="tiny" 
                            disabled={
                                editMode === "single" 
                                ? (auditTracking.length === 0 || recordNumber.length === 0) || filterError || (step === 1 && formChanges.length === 0) || step === 3
                                : (auditTracking.length === 0 || !recordDate || riID.length === 0) || filterError || (step === 1 && formChanges.length === 0) || step === 3
                            }
                        >
                            {step === 0 ? "Continue" : step === 1 ? "Review" : "Confirm & Save" }
                        </Button>
                    </Flex>
                </Flex>  
        </Flex>
    )
}   

export default EditFormsBody