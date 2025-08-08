import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FC } from 'react'
import { FlexHeaderSection } from '../../../lib/shared.styles'

interface BaseQAScreenHeaderProps {
    title: string
    subtitle: string
}

const QAScreenHeader: FC<BaseQAScreenHeaderProps> = ({ title, subtitle }) => {
  return (
      <FlexHeaderSection id='page-header' flexDirection='row' gap={aliasTokens.space500}>
        <Flex id='page-header-text' column gap={0}>
          <Text externalAs='h1' fontSize={Text.FontSize.s900} fontWeight={Text.FontWeight.bold}>
            {title}
          </Text>
          <Text fontSize={Text.FontSize.s300} fontWeight={Text.FontWeight.regular}>
            {subtitle}
          </Text>
        </Flex>
      </FlexHeaderSection>
  )
}

export default QAScreenHeader