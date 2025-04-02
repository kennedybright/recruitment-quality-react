import { FC, useEffect, useState } from 'react'
import '../../../i18n'
import { registerModule, useMAFContext, FOUNDATION_ID } from '../../../maf-api'
import { FlexWrapper, FlexHeaderSection } from './styles'
import { aliasTokens, Foundation } from '@nielsen-media/maf-fc-foundation'
import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import QAFormTop from './components/form-top'
import QAFormBody from './components/form-body'
import { QAFormProvider } from '../forms'
import { FlexContentBody } from '../../../lib/global/styles'
import { DataProvider } from '../../../lib/context/static-data'
import { fetchFormFields, fetchQRData } from '../../../lib/maf-api/api-form-data'
import { FormField } from '../../../lib/utils/qa-forms'
import { WarningFillIcon } from '@nielsen-media/maf-fc-icons'
import { Footer } from '../../../lib/global/components'

const QAFormAudioSMP: FC = () => {
  const [loading, setLoading] = useState(true)
  const { 
    selectors: { useUserData, useNavigate },
    notifier: { dialog, banner }
  } = useMAFContext()
  const { firstName, lastName, email } = useUserData()
  const userFullName = `${firstName} ${lastName}`

  const [userData, setUserData] = useState<{qrID:string, siteName:string}>({ qrID: "", siteName: "" })
  const [formFields, setFormFields] = useState<FormField[]>([])
  useEffect(() => { // Fetch user's QR ID & Site Name
    const fetchUserData = async(user: string) => { 
      try {
        const { qrID, siteName } = await fetchQRData(user)
        if (qrID && siteName) {
          setUserData({qrID: qrID, siteName: siteName})
        } else { 
          setUserData({ qrID: "N/A", siteName: "N/A" })
          banner.show(
            `No QRID found for user: ${userFullName}. The Contact Center Quality Team Manager has been notified.`,
            { variant: banner.variant.warning }
          )
          const errorMessage = `Our system was unable to locate <strong>${userFullName}</strong> in the Contact Center's QR database. Please verify the information
          and take any neccessary action to ensure they are properly added to the system. Let us know if you need further assistance.`
          // ENABLE WHEN GO LIVE // emailErrorReport(userFullName, 'QR User Missing in System', errorMessage)
        }
      } catch(err) {
        console.error("Error fetching current user's metadata: ", err)
        setUserData({qrID: "N/A", siteName: "N/A"})
      }
    }

    const fetchFields = async() => { // Fetch default Audio/SMP Form Fields
      try {
        const audioFields = await fetchFormFields(1001)
        if (audioFields) {
          const sortedFields = audioFields.sort((a, b) => a.id - b.id)
          const updatedFields = sortedFields.map((field) => {
            if (field.value === '1') return { ...field, value: 1}  // replace default value "1" string with 1 number
            if (field.value === 'false')  return { ...field, value: false} // replace default value "false" string with false boolean
            return field
          })
          setFormFields(updatedFields)
        }
      } catch(err) { console.error("Error fetching form fields: ", err) }
    }

    const initializeForms = async() => {
      await Promise.all([fetchFields(), fetchUserData(email)])
      setLoading(false)
    }
    initializeForms()
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
      <FlexWrapper id='starter-react-based' className='qa-form-monitoring' column gap={aliasTokens.space600}>
        <FlexHeaderSection id='page-header' flexDirection='row' gap={aliasTokens.space500}>
          <Flex id='page-header-text' column gap={0} flexBasis='68%'>
          <Text externalAs='h1' fontSize={Text.FontSize.s900} fontWeight={Text.FontWeight.bold}>
            Audio & SMP QA Monitoring Form
          </Text>
          <Text fontSize={Text.FontSize.s300} fontWeight={Text.FontWeight.regular}>
            Tracking the compliance of phone calls made by RIs to households being initially recruited for Audio PPM & Diary, and SMP.
          </Text>
          </Flex>
        </FlexHeaderSection> 
        
        <FlexContentBody id='qa-form-audio-smp' column>
          {/* QA Audio/SMP Form */}
          {!loading && (
            <DataProvider>
              <QAFormProvider userData={userData} appID={1001} formFields={formFields}>
                <QAFormTop /> 
                <QAFormBody />
              </QAFormProvider>
            </DataProvider>  
          )}
        </FlexContentBody>

        <Footer />
      </FlexWrapper>
    </Foundation>
  )
}

registerModule(QAFormAudioSMP)
export default QAFormAudioSMP
