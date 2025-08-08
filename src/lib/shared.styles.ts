import Flex from '@nielsen-media/maf-fc-flex'
import styled from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'

export const FlexContentBody = styled(Flex)`
    gap: ${aliasTokens.space450};
    width: 100%;
    justify-content: center;
`

export const FlexFooter = styled(Flex)`
    padding: ${aliasTokens.space700};
`

export const FlexLoading = styled(Flex)`
  width: 100%;
  height: 100%;
  padding-top: ${aliasTokens.space900}
`

// Global divider line
export const Divider = styled.hr`
    border: 0;
    clear: both;
    display: block;
    width: 100%;               
    background-color: ${aliasTokens.color.neutral200};
    height: 1px;
`

export const FlexHeaderSection = styled(Flex)`
  padding: ${aliasTokens.space350} ${aliasTokens.space800};
  align-items: center;
`

export const FlexWrapper800 = styled(Flex)`
  padding: ${aliasTokens.space800};
  min-width: 100%;
`

export const FlexWrapper400800 = styled(Flex)`
  padding: ${aliasTokens.space400} ${aliasTokens.space800};
  min-width: 100%;
`

export const FlexWrapper350 = styled(Flex)`
  padding: ${aliasTokens.space350};
  justify-content: center;
`