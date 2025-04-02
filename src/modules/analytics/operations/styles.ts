import Flex from '@nielsen-media/maf-fc-flex'
import styled, { AnyStyledComponent, StyledComponent } from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'

export const FlexView = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space600};
  background-color: ${aliasTokens.color.neutral200Opacity};
  border-radius: ${aliasTokens.radius200};
`

export const FlexPageHeader = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space350} ${aliasTokens.space800};
  align-items: center;
  justify-content: center;
`

export const FlexDateRange = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space450} 0;
  width: 320px;
`

export const FlexTableHeader = styled(Flex as unknown as AnyStyledComponent)`
  justify-content: flex-end;
`

export const FlexBody = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space700} ${aliasTokens.space350};
  max-width: 1272px;
`

export const FlexContentBody = styled(Flex as unknown as AnyStyledComponent)`
    gap: ${aliasTokens.space450};
    width: 100%;
    justify-content: center;
`

export const FlexFormDetails = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space450};
  background-color: ${aliasTokens.color.primary300};
  border-radius: ${aliasTokens.radius200};
  max-width: 1272px;
`

export const FlexWrapperHeaderText = styled(Flex as unknown as AnyStyledComponent)`
  max-width: 1272px;
`