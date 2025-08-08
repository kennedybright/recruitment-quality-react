import Flex from '@nielsen-media/maf-fc-flex'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import SingleSelect from '@nielsen-media/maf-fc-select'
import HookFormInput from '@nielsen-media/maf-fc-input'
import Input from '@nielsen-media/maf-fc-input'
import styled from 'styled-components'


export const FlexBodyWrapper = styled(Flex)`
  min-width: 100%;
`

export const FlexWrapperHeaderText = styled(Flex)`
  padding: ${aliasTokens.space350} 0;
`

export const FlexFormHeader = styled(Flex)`
  padding: ${aliasTokens.space700};
  background-color: ${aliasTokens.color.primary300};
  border-radius: ${aliasTokens.radius200};
`

export const StyledEditParamInput = styled(HookFormInput)`
  width: 100%;
`

export const StyledDropdown = styled(SingleSelect)`
  flex: auto;
  max-width: 110px;
`

export const FlexEditParams = styled(Flex)`
  padding: ${aliasTokens.space600} 0;
`

export const FlexFormBody = styled(Flex)`
  padding: ${aliasTokens.space700} ${aliasTokens.space350};
  min-width: 100%;
`

export const BulkFieldSelect = styled(SingleSelect)`
  width: 220px;
`

export const BulkValueInput = styled(Input)`
  border-radius: 0px 9px 9px 0px;
  width: 320px;
`

export const BulkValueSelect = styled(SingleSelect)`
  width: 320px;
`

export const FlexFormChangesBody = styled(Flex)`
  padding: ${aliasTokens.space350} ${aliasTokens.space800};
`