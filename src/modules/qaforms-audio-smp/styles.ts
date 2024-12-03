import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import Input from '@nielsen-media/maf-fc-input'
import styled, { withTheme } from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import Card from '@nielsen-media/maf-fc-card'
import Button from '@nielsen-media/maf-fc-button'
import SingleSelect from '@nielsen-media/maf-fc-select'
import HookFormInput from '@nielsen-media/maf-fc-input'
import { CheckmarkIcon, DeleteOutlineIcon, PhoneFillIcon, UserCircleFillIcon } from '@nielsen-media/maf-fc-icons'
import Pagination from '@nielsen-media/maf-fc-pagination'
import SelectionCart from '@nielsen-media/maf-fc-selection-cart'

export const FlexWrapper = styled(Flex)`
  padding: ${aliasTokens.space800};
  min-width: 100%;
`

export const FlexHeaderSection = styled(Flex)`
  padding: ${aliasTokens.space350} ${aliasTokens.space800};
  align-items: center;
`

export const FlexSection = styled(Flex)`
  padding: ${aliasTokens.space350};
  justify-content: center;
`

export const FlexBody = styled(Flex)`
  padding: ${aliasTokens.space700} ${aliasTokens.space350};
`

export const FlexFooter = styled(Flex)`
  padding: ${aliasTokens.space700} 0;
`

export const FlexFormHeader = styled(Flex)`
  padding: ${aliasTokens.space350};
  background-color: ${aliasTokens.color.neutral200Opacity};
  border-radius: ${aliasTokens.radius200};
`

export const FlexFormDetails = styled(Flex)`
  padding: ${aliasTokens.space450};
  background-color: ${aliasTokens.color.primary300};
  border-radius: ${aliasTokens.radius200};
`

export const FlexWrapperHeaderText = styled(Flex)`
  flex-basis: 68%;
`

export const FlexWrapperHeaderBtnGroup = styled(Flex)`
  flex-basis: 32%;
  justify-content: flex-end;
  height: ${aliasTokens.space800};
`

export const FlexWrapperFooterBtnGroup = styled(Flex)`
  padding: ${aliasTokens.space700};
  height: ${aliasTokens.space800};
  align-items: center;
  justify-content: center;
`

export const StyledInput = styled(Input)`
  max-width: 150px;
`

export const StyledPagination = styled(Pagination)`
  padding: ${aliasTokens.space350};
  border-color: ${aliasTokens.color.primary500};
  align-items: center;
  justify-content: center;
`

export const StyledCounter = styled(SelectionCart)`
  padding: ${aliasTokens.space350};
  flex-grow: 1;
  background-color: ${({ isExpanded }) => (isExpanded ? aliasTokens.color.white : 'none')};
`

export const CodeContainer = styled.pre`
  border-radius: ${aliasTokens.space300};
  overflow: auto;
  max-height: ${aliasTokens.layoutSize500};
`

export const StyledCard = styled(Card)`
  height: auto;
`

export const StyledSubmitIcon = styled(CheckmarkIcon)`
  color: ${aliasTokens.color.whitePersist};
`

export const StyledDeleteIcon = styled(DeleteOutlineIcon)`
  color: ${aliasTokens.color.whitePersist};
`

export const StyledPhoneIcon = styled(PhoneFillIcon)`
  color: ${aliasTokens.color.whitePersist};
`

export const StyledUserIcon = styled(UserCircleFillIcon)`
  color: ${aliasTokens.color.whitePersist};
`

export const StyledDropdown = styled(SingleSelect)`
  flex: auto;
  width: 110px;
`

export const StyledInputField = styled(HookFormInput)`
  width: 150px;
`

export const StyledInputValue = styled.span`
  font-size: ${Text.FontSize.s200}; 
  font-weight: ${Text.FontWeight.bold};
`
