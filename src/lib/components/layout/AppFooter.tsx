import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import { aliasTokens, MAFElement } from '@nielsen-media/maf-fc-foundation'
import { FlexFooter } from '../../shared.styles'
import Link from '@nielsen-media/maf-fc-link'
import { FC } from 'react'

// Global Page Footer
export const Footer: FC<MAFElement> = ({ className = 'page-footer' }) => (
  <FlexFooter className={className} id='page-footer' column gap={aliasTokens.space300}>
        <Text textAlign='center' color={aliasTokens.color.neutral700} fontSize='s0' fontWeight='regular'>
            Copyright © 2024 The Nielsen Company (US), LLC.<br />All Rights Reserved. Confidential and Proprietary.
        </Text>
        <Flex className={`${className}-links`} flexDirection='row' gap={aliasTokens.space800} alignSelf='center'>
            <Link fontWeight="bold" href="https://www.nielsen.com" target="_blank" variant="secondary" fontSize='s100'>
                Terms of Use
            </Link>
            <Link fontWeight="bold" href="https://www.nielsen.com/us/en/legal/privacy-statement/" target="_blank" variant="secondary" fontSize='s100'>
                Privacy Policy
            </Link>
        </Flex>
  </FlexFooter>
)