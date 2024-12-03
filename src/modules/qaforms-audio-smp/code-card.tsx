import Flex from '@nielsen-media/maf-fc-flex'
import { aliasTokens, useGDSConfig } from '@nielsen-media/maf-fc-foundation'
import Accordion from '@nielsen-media/maf-fc-accordion'
import { CodeContainer, StyledCard } from './styles'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Prism as MAFCode } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeCard: FC = ({ children, ...props }) => {
  const theme = useGDSConfig().isDarkTheme ? oneDark : oneLight
  const { t } = useTranslation()
  return (
    <StyledCard {...props}>
      <Flex column gap={aliasTokens.space400}>
        {children[0]}
        <Accordion>
          <Accordion.Item label={t('Show Code')} value='showCode'>
            <CodeContainer>
              <MAFCode language='javascript' style={theme}>
                {children[1]}
              </MAFCode>
            </CodeContainer>
          </Accordion.Item>
        </Accordion>
      </Flex>
    </StyledCard>
  )
}
export default CodeCard
