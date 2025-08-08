import styled, { AnyStyledComponent } from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import ContextSwitcher from '@nielsen-media/maf-fc-context-switcher'

export const StyledToggle = styled(ContextSwitcher as unknown as AnyStyledComponent)`
    justify-items: flex-end;
    overflow-x: unset;
    width: 100%
`