import Flex from '@nielsen-media/maf-fc-flex'
import styled, { AnyStyledComponent, StyledComponent } from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'

export const FlexContentBody = styled(Flex as unknown as AnyStyledComponent)`
    gap: ${aliasTokens.space450};
    width: 100%;
    justify-content: center;
`

export const FlexFooter = styled(Flex as unknown as AnyStyledComponent)`
    padding: ${aliasTokens.space700};
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