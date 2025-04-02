import { FC, useEffect, useState } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import { aliasTokens, Foundation } from '@nielsen-media/maf-fc-foundation'
import { registerModule, useMAFContext, FOUNDATION_ID } from '../../maf-api'
import '../../i18n'
import { FlexHeaderSection, FlexWrapper } from '../qaforms/qaforms-audio-smp/styles'
import { ReportProvider } from './reports/reports'
import GenerateReportBody from './components/page-body'
import { WarningFillIcon } from '@nielsen-media/maf-fc-icons'
import { DataProvider } from '../../lib/context/static-data'
import { FlexContentBody } from '../../lib/global/styles'
import { Footer } from '../../lib/global/components'

const GenerateNewReport: FC = () => {
  const [loading, setLoading] = useState(true)
  const {
    selectors: { useUserData, useNavigate },
    notifier: { dialog, banner } 
  } = useMAFContext()
  
  const today = new Date().toISOString().split('T')[0] // put current date in YYYY-MM-DD format
  const { firstName, lastName, email } = useUserData()
  const userFullName = `${firstName} ${lastName}`
  const [qr, setQR] = useState<string>("")
  
  useEffect(() => { // Fetch user's QR ID using API
    const fetchUserData = async(user: string) => {
      try {
        const { fetchQRData } = await import('../../lib/maf-api/api-form-data')
        const { qrID } = await fetchQRData(user)
        if (qrID) setQR(qrID)
        else {
          banner.show(
            `No QRID found for user: ${userFullName}. The Contact Center Quality Team Manager has been notified.`,
            { variant: banner.variant.warning }
          )
          const errorMessage = `Our system was unable to locate <strong>${userFullName}</strong> in the Contact Center's QR database. Please verify the information
          and take any neccessary action to ensure they are properly added to the system. Let us know if you need further assistance.`
          // ENABLE WHEN GO LIVE // emailErrorReport(userFullName, 'QR User Missing in System', errorMessage)
        }
        setLoading(false)
      } catch(err) {
        console.error("Error fetching current user's metadata: ", err)
        setQR("N/A")
      }
    }
    fetchUserData(email)
  }, [])

  useNavigate((confirm, cancel) => {
    dialog.show('Are you sure that you want to leave?', {
      icon: WarningFillIcon,
      variant: dialog.variant.warning,
      message: 'You have started monitoring. Current changes you made may not be saved.',
      buttons: {
        confirm: {
          onClick: () => {
            console.log("Exiting Audio/SMP QA monitoring form...")
            confirm()
          },
          text: 'Proceed',
        },
        cancel: {
          onClick: () => cancel(),
          text: 'Cancel',
        },
      },
    })
  })

  return (
    <Foundation
      id={FOUNDATION_ID}
      initConfig={{ rootSelector: FOUNDATION_ID }}
    >
      <FlexWrapper id='starter-react-based' className='generate-new-reports' column gap={aliasTokens.space450}>
        <FlexHeaderSection id='page-header' flexDirection='row' gap={aliasTokens.space500}>
          <Flex id='page-header-text' column gap={0} flexBasis='68%' >
            <Text externalAs='h1' fontSize={Text.FontSize.s900} fontWeight={Text.FontWeight.bold}>
              Generate New Reports
            </Text>
            <Text fontSize={Text.FontSize.s300} fontWeight={Text.FontWeight.regular}>
              Select the type of daily report you wish to generate, review the details, and easily send it to the manager via email.
            </Text>
          </Flex>
        </FlexHeaderSection> 

        <FlexContentBody id='page-body' column>
          {/* Generate Report Body - All steps */}
          {!loading && (
            <DataProvider>
              <ReportProvider qr={qr} date={today}>
                <GenerateReportBody /> 
              </ReportProvider>
            </DataProvider>
          )}
        </FlexContentBody>
        
        <Footer />
      </FlexWrapper>
    </Foundation>
  )
}

registerModule(GenerateNewReport)
export default GenerateNewReport