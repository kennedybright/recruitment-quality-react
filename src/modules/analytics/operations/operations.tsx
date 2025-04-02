import { FC } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import { aliasTokens, Foundation } from '@nielsen-media/maf-fc-foundation'
import { registerModule, useMAFContext, FOUNDATION_ID } from '../../../maf-api'
import '../../../i18n'
import { FlexWrapper } from '../../qaforms/qaforms-audio-smp/styles'
import { ACMReport } from './reports/report-acm'
import { LCMReport } from './reports/report-lcm'
import { FlexPageHeader, FlexContentBody } from './styles'
import { DataProvider } from '../../../lib/context/static-data'
import { Footer } from '../../../lib/global/components'

const Operations: FC = () => {
  const { selectors: { useUIToggles } } = useMAFContext()

  // UI toggle indication for ACM viewer access
  const seeACM = useUIToggles("CCQA_ANALYTICS_OPERATIONS_VIEWACM")
  
  return (
    <Foundation
      id={FOUNDATION_ID}
      initConfig={{ rootSelector: FOUNDATION_ID }}
    >
      <FlexWrapper id='starter-react-based' className='operations-dashboard' column gap={aliasTokens.space450} >
        <FlexPageHeader id='page-header' flexDirection='row' gap={aliasTokens.space500}>
          <Text externalAs='h1' fontSize={Text.FontSize.s900} fontWeight={Text.FontWeight.bold} textAlign='center'>
            Operations View
          </Text>
        </FlexPageHeader> 

        <FlexContentBody id='page-body' column>
          {/* All Reports */}
          <DataProvider>
            <LCMReport />
            {seeACM && <ACMReport />}
          </DataProvider>
        </FlexContentBody>
        
        <Footer />
      </FlexWrapper>
    </Foundation>
  )
}

registerModule(Operations)
export default Operations