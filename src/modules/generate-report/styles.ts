import styled from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import Tile, { TileProps } from '@nielsen-media/maf-fc-tile'
import { TotalDigitalIcon } from '@nielsen-media/maf-fc-icons'

export const Code = styled.div`
  padding: 0 ${aliasTokens.space400};
`

export const StyledTile = styled.div<Required<Pick<TileProps, 'size'>> & { isDarkTheme: boolean }>`
  width: 256px;
  &:active {
    background: ${({ isDarkTheme }) => (isDarkTheme ? aliasTokens.color.gradient.primary100 : aliasTokens.color.gradient.primary200)};
  }
`
