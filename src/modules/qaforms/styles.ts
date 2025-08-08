import Flex from '@nielsen-media/maf-fc-flex'
import styled, { css } from 'styled-components'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { SingleSelect } from '@nielsen-media/maf-fc-select'
import { FormMode } from 'src/lib/types/forms.types'
import SelectionCart from '@nielsen-media/maf-fc-selection-cart'
import { CheckAllIcon, CheckmarkIcon, DeleteOutlineIcon } from '@nielsen-media/maf-fc-icons'
import HookFormInput from '@nielsen-media/maf-fc-input'
import Pagination from '@nielsen-media/maf-fc-pagination'
import Banner from '@nielsen-media/maf-fc-banner'

export const QAFormViewHeaderText = styled(Flex)`
    padding: ${aliasTokens.space400};
`

export const FlexFormTop = styled(Flex)`
    padding: ${aliasTokens.space600};
    background-color: ${aliasTokens.color.neutral200Opacity};
    border-radius: ${aliasTokens.radius200};
`

export const FlexFormBody = styled(Flex)`
    padding: ${aliasTokens.space700} ${aliasTokens.space350};
`

export const FlexFormDetails = styled(Flex)`
    padding: ${aliasTokens.space500};
    background-color: ${aliasTokens.color.primary300};
    border-radius: ${aliasTokens.radius200};
    max-height: fit-content;
`

export const StyledDropdown = styled(SingleSelect)<{ mode: FormMode }>`
    ${({ mode }) => mode === 'edit' 
        ? css`width: 150px;`
        : css`
        flex: auto;
        max-width: 110px;
        `
    }
`

export const StyledInputField = styled(HookFormInput)`
    width: 150px;
`

export const StyledCounter = styled(SelectionCart)`
    padding: ${aliasTokens.space350};
    background-color: ${({ isExpanded }) => (isExpanded ? aliasTokens.color.white : 'none')};
    min-width: 500px;
`

export const StyledPagination = styled(Pagination)`
    padding: ${aliasTokens.space350};
    border-color: ${aliasTokens.color.primary500};
    align-items: center;
    justify-content: center;
`

export const FlexScoringBannerGroup = styled(Flex)`
    padding-bottom: ${aliasTokens.space700};
`

export const StyledSubmitIcon = styled(CheckAllIcon)`
    color: ${aliasTokens.color.whitePersist};
`

export const StyledDeleteIcon = styled(DeleteOutlineIcon)`
    color: ${aliasTokens.color.whitePersist};
`

export const FlexWrapperFooterBtnGroup = styled(Flex)`
    padding: ${aliasTokens.space700};
    height: ${aliasTokens.space800};
    align-items: center;
    justify-content: center;
`

export const FlexFormSubmission = styled(Flex)`
    padding-top: ${aliasTokens.space900};
`