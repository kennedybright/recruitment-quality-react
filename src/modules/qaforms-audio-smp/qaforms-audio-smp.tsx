import React from 'react'
import '../../i18n'
import { registerModule, useMAFContext } from '../../maf-api'
import { FlexWrapper, FlexFooter } from './styles'
import { aliasTokens, dsHelper, Foundation } from '@nielsen-media/maf-fc-foundation'
import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import { useTranslation } from 'react-i18next'
import QAFormTop from './components/form-top'
import QAFormBody from './components/form-body'
import Link from '@nielsen-media/maf-fc-link'
import { QAFormProvider } from './shared/forms'


export const FOUNDATION_ID = '#starter-react-based'

export interface QAFormAudioSMPProps {
  className?: string
}

const QAFormAudioSMP: React.FC<QAFormAudioSMPProps> = ({ className }) => {
  const {
    actions: { navigate },
    selectors: { useNavigate, useAppPath },
    notifier: { dialog },
  } = useMAFContext()

  return (
    <Foundation
      id={FOUNDATION_ID}
      initConfig={{ rootSelector: FOUNDATION_ID }}
    >
      <FlexWrapper className={className} column gap={aliasTokens.space450} id='starter-react-based'>
        <QAFormProvider>
          <QAFormTop />
          <QAFormBody />
        </QAFormProvider>
        <FlexFooter id='page-footer' column gap={aliasTokens.space300}>
            <Text textAlign='center' color={aliasTokens.color.neutral700} fontSize='s0' fontWeight='regular'>
              Copyright © 2024 The Nielsen Company (US), LLC.<br />All Rights Reserved. Confidential and Proprietary.
            </Text>
            <Flex flexDirection='row' gap={aliasTokens.space800} alignSelf='center'>
              <Link fontWeight="bold" href="https://www.nielsen.com" target="_blank" variant="secondary" fontSize='s100'
              >
                Terms of Use
              </Link>
              <Link fontWeight="bold" href="https://www.nielsen.com/us/en/legal/privacy-statement/" target="_blank" variant="secondary" fontSize='s100'
              >
                Privacy Policy
              </Link>
            </Flex>
        </FlexFooter>
      </FlexWrapper>
    </Foundation>
  )
}

registerModule(QAFormAudioSMP)
export default QAFormAudioSMP
