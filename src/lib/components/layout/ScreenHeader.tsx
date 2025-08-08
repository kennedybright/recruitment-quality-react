import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FC } from 'react'
import { FlexHeaderSection } from '../../shared.styles'

interface BaseScreenHeaderProps {
    title: string
    subtitle?: string
    align?: 'left' | 'center' | 'right'
}

const ScreenHeader: FC<BaseScreenHeaderProps> = ({ title, subtitle, align }) => {
    return (
        <FlexHeaderSection className='page-header' flexDirection='row' gap={aliasTokens.space500}>
            <Flex className='page-header-text' column gap={0}>
                <Text externalAs='h1' fontSize={Text.FontSize.s900} fontWeight={Text.FontWeight.bold} textAlign={align}>
                    {title}
                </Text>
                <Text fontSize={Text.FontSize.s300} fontWeight={Text.FontWeight.regular}>
                    {subtitle}
                </Text>
            </Flex>
        </FlexHeaderSection>
    )
}

export default ScreenHeader