import styled, { AnyStyledComponent } from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import ContextSwitcher from '@nielsen-media/maf-fc-context-switcher'
import Flex from '@nielsen-media/maf-fc-flex'
import { SingleSelect } from '@nielsen-media/maf-fc-select'

export const StyledToggle = styled(ContextSwitcher as unknown as AnyStyledComponent)`
    justify-items: flex-end;
    overflow-x: unset;
    width: 100%
`

export const FlexAIQuery = styled(Flex)`
    padding: 0px ${aliasTokens.space500};
`

export const FlexAIFilters = styled(Flex)`
    display: block;
`

export const FlexQueryGroup = styled(Flex)`
    padding: ${aliasTokens.space500} 0px;
    border: solid ${aliasTokens.color.neutral200};
    border-radius: ${aliasTokens.space400};
`

export const QuerySingleSelect = styled(SingleSelect)`
    width: 256px;
`