import styled, { AnyStyledComponent } from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import Flex from '@nielsen-media/maf-fc-flex'
import SingleSelect from '@nielsen-media/maf-fc-select'
import ToggleButton from '@nielsen-media/maf-fc-toggle-button'

export const ReportToggleButton = styled(ToggleButton as unknown as AnyStyledComponent)`
  width: 100%;
  height: 100%;
`

export const FlexPDFLoading = styled(Flex as unknown as AnyStyledComponent)`
  width: 100%;
  height: 100%;
  background-color: ${aliasTokens.color.neutral200};
  align-items: center;
  justify-content: center;
`

export const FlexText = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space400};
  width: 256px;
`

export const FlexReviewReport = styled(Flex as unknown as AnyStyledComponent)`
  padding: 35px;
`

export const FlexViewer = styled(Flex as unknown as AnyStyledComponent)`
  width: 100%;
  height: 720px;
  align-items: center;
  justify-content: center;
`

export const FlexMessageStatus = styled(Flex as unknown as AnyStyledComponent)`
  min-width: 500px;
  min-height: 256px;
  align-items: center;
  gap: 24px;
  justify-content: center;
`

export const FlexButton = styled(Flex as unknown as AnyStyledComponent)`
  width: 256px;
  height: 170px;
`

export const StyledFilterDropdown = styled(SingleSelect as unknown as AnyStyledComponent)`
  flex: auto;
  align-items: center;
  width: 250px;
`