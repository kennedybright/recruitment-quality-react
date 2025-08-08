import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FC } from 'react'
import { FormMode } from '../../../lib/types/forms.types'
import { useEditContext } from '../../edit-forms/base/edit.context'
import Button from '@nielsen-media/maf-fc-button'
import { ResetIcon } from '@nielsen-media/maf-fc-icons'

interface FormHeaderProps {
    mode: FormMode
	formID: number
}

export const FormTopHeader: FC<FormHeaderProps> = ({ mode, formID }) => {
	if (mode === 'readonly') return (
		<Flex className='form header' gap={aliasTokens.space350}>
			<Text className='form header__title' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold}>
				Record Number:
			</Text>
			<Text className='form header__record number' data-selector='record_number' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold} color={aliasTokens.color.primary600}>
				{formID}
			</Text>
		</Flex>
	)

	// default: 'edit' mode
	const { clearAllEdits } = useEditContext()

	return (
		<Flex className="single edit__form header" flexDirection='row' gap={aliasTokens.space500} justifyContent='space-between'>
			<Flex className='form header' gap={aliasTokens.space350}>
				<Text className='form header__title' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold}>
					Edit Single Form:
				</Text>
				<Text className='form header__record number' data-selector='record_number' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold} color={aliasTokens.color.primary600}>
					{formID}
				</Text>
			</Flex>
			<Button 
				className='edit button__reset'
				type='button'
				variant='tertiary'
				size='compact'  
				view='outlined'
				aria-label='single edit reset all changes'
				roundedCorners='all'
				icon={{
					icon: ResetIcon,
					iconPosition: 'left'
				}}
				onClick={clearAllEdits}
			>
				Reset All Changes
			</Button>
		</Flex>
	)
}

export const FormBodyHeader: FC = () => {
	return (
		<Flex className='form-body-header-text' column gap={0}>
			<Text className="form-body-title" externalAs='h3' fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold}>
				Recruitment QA Assessment
			</Text>
			<Text className="form-body-subtitle" fontSize={Text.FontSize.s100} fontWeight={Text.FontWeight.regular} color={aliasTokens.color.neutral700}>
				Confirm the form details for the current phone call. Please review the call and complete the appropriate fields accurately. Ensure that each section is reviewed before submitting the form.
			</Text>
		</Flex>
	)
}