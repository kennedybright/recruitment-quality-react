import { FC, useState, lazy, Suspense } from 'react'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { useMAFContext } from '../../../maf-api'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import { useReportContext } from '../reports/reports'
import { FlexSection, FlexWrapper } from '../../qaforms/qaforms-audio-smp/styles'
import Button from '@nielsen-media/maf-fc-button'
import Stepper from '@nielsen-media/maf-fc-stepper'
import { Loading } from '../../../lib/global/components'

const ChooseReport = lazy(() => import('./choose-report'))
const ReviewReport = lazy(() => import('./review-report'))
const SendReport = lazy(() => import('./send-report'))

const GenerateReportBody: FC = () => {
    const { actions: { navigate } } = useMAFContext()
    const { riID, reportName, reportData, resetReport, emailError, isRendering } = useReportContext()

    // Load the steps once user data are fetched
    const steps = [ "Choose Report", "Review Report", "Send Report"]
    const [step, setStep] = useState<number>(0)

    // Go to next step
    const next = () => { 
        setStep((prevStep) => prevStep + 1)
        navigate({ appState: { step: steps[step+1], report: reportName } }) 
    }

    // Go to previous step
    const prev = () => { 
        setStep((prevStep) => prevStep - 1)
        if (steps[step-1] === "Choose Report") {
            resetReport()
            navigate({ appState: { step: steps[step-1] } })
        }
        navigate({ appState: { step: steps[step-1], report: reportName } })
    }

    const ReportHeader = () => (
        <FlexSection className='report-header' column>
            <Text className='report-header-title' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold} textAlign='center'>
                {step === 0 && "Which report would you like to create?"}
                {step === 1 && `Review Your ${reportName}`}
            </Text>
            {step === 1 && (
                <Text className="report-header-subtitle" fontSize={Text.FontSize.s300} fontWeight={Text.FontWeight.regular} color={aliasTokens.color.neutral700} textAlign='center'>
                    Confirm the generated report is accurate. If the report is not accurate, please make the appropiate changes before sending the report to your manager.
                </Text>
            )}
        </FlexSection>
    )

    return (
        <Flex className='page-body' column>
            <FlexWrapper className='report-grid' column gap={aliasTokens.space500}>
                {<ReportHeader />}
                <Suspense fallback={<Loading className={steps[step].toLowerCase().replaceAll(" ", "-")} />}>
                    {step === 0 && <ChooseReport />}
                    {step === 1 && <ReviewReport />}
                    {step === 2 && <SendReport />}
                </Suspense>
            </FlexWrapper>
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
                    <Button className='btn-back' onClick={prev} size="tiny" disabled={step === 0}>
                        Go Back
                    </Button>
                    <Button className='btn-next' onClick={next} size="tiny" disabled={step === 2 || !reportName || !riID || (step === 1 && !reportData)}>
                        {step < 1 ? "Continue" : "Confirm & Send"}
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    )
}   

export default GenerateReportBody