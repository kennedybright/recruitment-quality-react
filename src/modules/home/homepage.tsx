import { FC, useEffect, useState } from 'react'
import '../../i18n'
import { registerModule, useMAFContext, FOUNDATION_ID } from '../../maf-api'
import { aliasTokens, Foundation } from '@nielsen-media/maf-fc-foundation'
import { fetchQRData } from '../../lib/maf-api/api-form-data'
import { FlexWrapper } from '../qaforms/qaforms-audio-smp/styles'

const Homepage: FC = () => {
  const { 
    selectors: { useUserData },
    notifier: { banner }
  } = useMAFContext()
  const { firstName, lastName, email } = useUserData()
  const userFullName = `${firstName} ${lastName}`

  const [userData, setUserData] = useState<{qrID:string, siteName:string}>({ qrID: "", siteName: "" })
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

    fetchUserData(email)
  }, [])


  return (
    <Foundation
      id={FOUNDATION_ID}
      initConfig={{ rootSelector: FOUNDATION_ID }}
    >
      <FlexWrapper id='starter-react-based' className='homepage' column gap={aliasTokens.space600}>
        
      </FlexWrapper>
    </Foundation>
  )
}

registerModule(Homepage)
export default Homepage
