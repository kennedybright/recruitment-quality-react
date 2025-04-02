import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import styled, { AnyStyledComponent } from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import SingleSelect from '@nielsen-media/maf-fc-select'
import HookFormInput from '@nielsen-media/maf-fc-input'
import { CheckmarkIcon, DeleteOutlineIcon, PhoneFillIcon, UserCircleFillIcon } from '@nielsen-media/maf-fc-icons'
import Pagination from '@nielsen-media/maf-fc-pagination'
import SelectionCart from '@nielsen-media/maf-fc-selection-cart'
import ContextSwitcher from '@nielsen-media/maf-fc-context-switcher'

export const FlexWrapper = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space800};
  min-width: 100%;
`

export const FlexHeaderSection = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space350} ${aliasTokens.space800};
  align-items: center;
`

export const FlexSection = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space350};
  justify-content: center;
`

export const FlexBody = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space700} ${aliasTokens.space350};
`

export const FlexFormHeader = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space350};
  background-color: ${aliasTokens.color.neutral200Opacity};
  border-radius: ${aliasTokens.radius200};
`

export const FlexFormDetails = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space450};
  background-color: ${aliasTokens.color.primary300};
  border-radius: ${aliasTokens.radius200};
`

export const FlexWrapperHeaderText = styled(Flex as unknown as AnyStyledComponent)`
  flex-basis: 74%;
`

export const QAFormViewHeaderText = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space400};
`

export const FlexWrapperHeaderBtnGroup = styled(Flex as unknown as AnyStyledComponent)`
  flex-basis: 32%;
  justify-content: flex-end;
`

export const FlexWrapperFooterBtnGroup = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space700};
  height: ${aliasTokens.space800};
  align-items: center;
  justify-content: center;
`

export const StyledPagination = styled(Pagination as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space350};
  border-color: ${aliasTokens.color.primary500};
  align-items: center;
  justify-content: center;
`

export const StyledCounter = styled(SelectionCart as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space350};
  background-color: ${({ isExpanded }) => (isExpanded ? aliasTokens.color.white : 'none')};
`

export const StyledSubmitIcon = styled(CheckmarkIcon as unknown as AnyStyledComponent)`
  color: ${aliasTokens.color.whitePersist};
`

export const StyledDeleteIcon = styled(DeleteOutlineIcon as unknown as AnyStyledComponent)`
  color: ${aliasTokens.color.whitePersist};
`

export const StyledPhoneIcon = styled(PhoneFillIcon as unknown as AnyStyledComponent)`
  color: ${aliasTokens.color.whitePersist};
`

export const StyledUserIcon = styled(UserCircleFillIcon as unknown as AnyStyledComponent)`
  color: ${aliasTokens.color.whitePersist};
`

export const StyledDropdown = styled(SingleSelect as unknown as AnyStyledComponent)`
  flex: auto;
  max-width: 110px;
`

export const StyledInputField = styled(HookFormInput as unknown as AnyStyledComponent)`
  width: 150px;
`

export const StyledToggle = styled(ContextSwitcher as unknown as AnyStyledComponent)`
  justify-items: flex-end;
  overflow-x: unset;
`

export const StyledInputValue = styled.span`
  font-size: ${Text.FontSize.s200}; 
  font-weight: ${Text.FontWeight.bold};
`

export const FlexLoading = styled(Flex as unknown as AnyStyledComponent)`
  width: 100%;
  height: 100%;
`

export const FlexFormSubmission = styled(Flex as unknown as AnyStyledComponent)`
  padding-top: ${aliasTokens.space900};
`
