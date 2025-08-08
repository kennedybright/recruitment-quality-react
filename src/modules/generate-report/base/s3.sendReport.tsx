import { useEffect, useState } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import { useReportContext } from '../components/reports'
import { FlexMessageStatus } from '../styles'
import DisplayIcon, { DisplayIconSize } from '@nielsen-media/maf-fc-display-icon'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { CheckmarkIcon, ErrorOutlineIcon } from '@nielsen-media/maf-fc-icons'
import { Loading } from '../../../lib/components/feedback/LoaderSpinner'
import { emailErrorReport } from '../../../lib/maf-api/services/email.service'
import { FlexWrapper800 } from '../../../lib/shared.styles'
import { useDataContext } from '../../../lib/context/data.context'
import { FETCHSTATUS } from '../../../lib/utils/helpers'
import Button from '@nielsen-media/maf-fc-button'


const SendReport = () => {
    const { currentUser } = useDataContext()
    const { pdfBlob, sendReport, setEmailSent, exit } = useReportContext()

    const [status, setStatus] = useState<FETCHSTATUS>('loading') // status of emailing report & email status message
    
    useEffect(() => { // Email PDF report to RI's manager
        const emailPDFReport = async () => {
            if (pdfBlob) {
                try {
                    const res = await sendReport()
                    setStatus(res as FETCHSTATUS)
                    res === 'success' ? setEmailSent(true) : setEmailSent(false)
                } catch (error) {
                    setStatus('error')
                    setEmailSent(false)
                    console.error("Error emailing report: ", error)
                    onError(error.message)
                }
            }
        }
        emailPDFReport()
    }, [])

    const onError = (message) => {
        console.log(`${message} Sending error report...`)
        emailErrorReport(currentUser.fullName, 'Edited Forms submission attempt', message)
    }

    if (status === 'loading') return <Loading id="send-report" /> // Loading state
    
    return (
        <FlexWrapper800 className='send-report' column gap={aliasTokens.space500}>
            {status === 'success' && (
                <FlexMessageStatus flexDirection='column'>
                    <DisplayIcon
                        icon={CheckmarkIcon}
                        size={DisplayIconSize.s700}
                        variant='success'
                    />
                    <Text className="email-status-message" fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold} textAlign='center'>
                        This report has been successfully sent to the Manager.
                    </Text>
                    <Button
                        className='btn-generate-report-start-over'
                        size="compact"
                        variant='tertiary'
                        autoFocus
                        onClick={exit}
                        type='reset'
                    >
                        Start Over & Generate a New Report
                    </Button>
                </FlexMessageStatus>
            )}
            {status === 'error' && (
                <FlexMessageStatus flexDirection='column'>
                    <DisplayIcon
                        icon={ErrorOutlineIcon}
                        size={DisplayIconSize.s700}
                        variant='danger'
                    />
                    <Text className="email-status-message" fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold} textAlign='center'>
                        This report has failed to send to the Manager. Please go back and try again.
                    </Text>
                </FlexMessageStatus>
            )}
        </FlexWrapper800>
    )
}

export default SendReport