import { useEffect, useState } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import { useReportContext } from '../reports/reports'
import { FlexWrapper } from '../../qaforms/qaforms-audio-smp/styles'
import { FlexMessageStatus } from '../styles'
import DisplayIcon, { DisplayIconSize } from '@nielsen-media/maf-fc-display-icon'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { CheckmarkIcon, ErrorOutlineIcon } from '@nielsen-media/maf-fc-icons'
import { Loading } from '../../../lib/global/components'
import { useMAFContext } from '../../../maf-api'
import { emailErrorReport } from '../../../lib/maf-api/api-form-data'

const SendReport = () => {
    const { selectors: { useUserData } } = useMAFContext()
    const { firstName, lastName } = useUserData()
    const { pdfBlob, sendReport } = useReportContext()

    const [status, setStatus] = useState('loading') // status of emailing report & email status message
    
    useEffect(() => { // Email PDF report to RI's manager
        const emailPDFReport = async () => {
            if (pdfBlob) {
                try {
                    const res = await sendReport()
                    res === "success" ? setStatus('success') : setStatus('error')
                } catch (error) {
                    setStatus('error')
                    console.error("Error emailing report: ", error)
                    onError(error.message)
                }
            }
        }
        emailPDFReport()
    }, [])

    const onError = (message) => {
        const userFullName = `${firstName} ${lastName}`
        console.log(`${message} Sending error report...`)
        emailErrorReport(userFullName, 'Edited Forms submission attempt', message)
    }

    if (status === 'loading') return <Loading className="send-report" /> // Loading state
    
    return (
        <FlexWrapper className='send-report' column gap={aliasTokens.space500}>
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
        </FlexWrapper>
    )
}

export default SendReport