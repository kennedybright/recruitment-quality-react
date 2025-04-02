import Flex from '@nielsen-media/maf-fc-flex'
import styled, { AnyStyledComponent } from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import SingleSelect from '@nielsen-media/maf-fc-select'
import HookFormInput from '@nielsen-media/maf-fc-input'
import Input from '@nielsen-media/maf-fc-input'

export const FlexWrapper = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space400} ${aliasTokens.space800};
  min-width: 100%;
`

export const FlexSection = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space350};
  justify-content: center;
`

export const FlexBodyWrapper = styled(Flex as unknown as AnyStyledComponent)`
  min-width: 100%;
`

export const FlexWrapperHeaderText = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space350} 0;
`

export const FlexFormHeader = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space700};
  background-color: ${aliasTokens.color.primary300};
  border-radius: ${aliasTokens.radius200};
`

export const StyledDropdown = styled(SingleSelect as unknown as AnyStyledComponent)`
  width: 150px;
`

export const StyledEditParamInput = styled(HookFormInput as unknown as AnyStyledComponent)`
  width: 100%;
`

export const FlexEditParams = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space600} 0;
`

export const FlexFormBody = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space700} ${aliasTokens.space350};
  min-width: 100%;
`

export const BulkFieldSelect = styled(SingleSelect as unknown as AnyStyledComponent)`
  width: 220px;
`

export const BulkValueInput = styled(Input as unknown as AnyStyledComponent)`
  border-radius: 0px 9px 9px 0px;
  width: 320px;
`

export const BulkValueSelect = styled(SingleSelect as unknown as AnyStyledComponent)`
  width: 320px;
`

export const FlexFormChangesBody = styled(Flex as unknown as AnyStyledComponent)`
  padding: ${aliasTokens.space350} ${aliasTokens.space800};
`