import { FC, useState, lazy, Suspense, useEffect } from 'react'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { useMAFContext } from '../../../maf-api'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import { useReportContext } from '../components/reports'
import Button from '@nielsen-media/maf-fc-button'
import Stepper from '@nielsen-media/maf-fc-stepper'
import { Loading } from '../../../lib/components/feedback/LoaderSpinner'
import { FlexWrapper350, FlexWrapper800 } from '../../../lib/shared.styles'
import { WarningFillIcon } from '@nielsen-media/maf-fc-icons'

const ChooseReport = lazy(() => import('./s1.chooseReport'))
const ReviewReport = lazy(() => import('./s2.reviewReport'))
const SendReport = lazy(() => import('./s3.sendReport'))

const GenerateReportBody: FC = () => {
    const { 
        actions: { navigate },
        notifier: { dialog }  
    } = useMAFContext()
    const { riID, reportName, reportDate, resetReport, emailError, isRendering, emailSent } = useReportContext()

    // Load the steps once user data are fetched
    const steps = [ "Choose Report", "Review Report", "Send Report"]
    const [step, setStep] = useState<number>(0)

    useEffect(() => {
        if (!reportName) navigate({}) // reset application state
    }, [reportName])

    // Go to next step
    const next = () => { 
        if (step !== 1) {
            setStep((prevStep) => prevStep + 1)
            navigate({ appState: { step: steps[step+1], report: reportName } }) 
        } else {
            dialog.show('Are you sure you want to send the report?', {
                icon: WarningFillIcon,
                variant: dialog.variant.warning,
                message: 'Please review the entire report before sending. Once emailed, you will not be able to make any further changes.',
                buttons: {
                    confirm: {
                      onClick: () => {
                        setStep((prevStep) => prevStep + 1)
                        navigate({ appState: { step: steps[step+1], report: reportName } })
                      },
                      text: 'Send'
                    }
                }
            })
        }
    }

    // Go to previous step
    const prev = () => { 
        setStep((prevStep) => prevStep - 1)
        if (steps[step-1] === "Choose Report") {
            resetReport()
            navigate({ appState: { step: steps[step-1] } })
        }
        else navigate({ appState: { step: steps[step-1], report: reportName } })
    }

    const ReportHeader = () => (
        <FlexWrapper350 className='report-header' column>
            <Text className='report-header-title' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold} textAlign='center'>
                {step === 0 && "Which report would you like to create?"}
                {step === 1 && `Review Your ${reportName}`}
            </Text>
            {step === 1 && (
                <Text className="report-header-subtitle" fontSize={Text.FontSize.s300} fontWeight={Text.FontWeight.regular} color={aliasTokens.color.neutral700} textAlign='center'>
                    Confirm the generated report is accurate. If the report is not accurate, please make the appropiate changes before sending the report to your manager.
                </Text>
            )}
        </FlexWrapper350>
    )

    return (
        <Flex className='page-body' column>
            <FlexWrapper800 className='report-grid' column gap={aliasTokens.space500}>
                {<ReportHeader />}
                <Suspense fallback={<Loading id={steps[step].toLowerCase().replaceAll(" ", "-")} />}>
                    {step === 0 && <ChooseReport />}
                    {step === 1 && <ReviewReport />}
                    {step === 2 && <SendReport />}
                </Suspense>
            </FlexWrapper800>
            <Flex column className='page-stepper'>
                <Stepper
                    direction="horizontal"
                    linear
                    onChange={((stepNumber) => { setStep(stepNumber) })}
                    selectedIndex={step}
                    steps={[
                        {
                            completed: (step > 0) ? true : false,
                            title: 'Choose Report',
                            required: true
                        },
                        {
                            completed: (step > 1) ? true : false,
                            title: 'Review Report',
                            error: !isRendering
                        },
                        {
                            completed: (step === 2) ? true : false,
                            title: 'Send Report',
                            error: emailError ? true : false
                        }
                    ]}
                />
                <Flex className="stepper-btns" flexDirection='row' gap={aliasTokens.space400} justifyContent="center">
                    <Button 
                        className='btn-back' 
                        onClick={prev} 
                        size="tiny" 
                        disabled={step === 0 || (step === 2 && emailSent)}
                    >
                        Go Back
                    </Button>
                    <Button 
                        className='btn-next' 
                        onClick={next} 
                        size="tiny" 
                        disabled={step === 2 || !reportName || !riID || !reportDate || (step === 1 && !isRendering)}
                        autoFocus={step === 0 && reportName && riID && !!reportDate}
                    >
                        {step < 1 ? "Continue" : "Confirm & Send"}
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    )
}   

export default GenerateReportBody