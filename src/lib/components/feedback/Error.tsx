import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import { ErrorFillIcon } from '@nielsen-media/maf-fc-icons'
import DisplayIcon from '@nielsen-media/maf-fc-display-icon'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'

// Global Loading component
export const ErrorPage = ({className, errorMessage, errorHeader}:{className:string, errorMessage:string, errorHeader?:string}) => (
	<Flex className={className} column alignItems='center' justifyContent='center' gap={aliasTokens.space500}>
		<DisplayIcon icon={ErrorFillIcon} variant="danger" />
		<Flex className="error" column alignItems='center' gap={aliasTokens.space300}>
			<Text externalAs='h1' fontSize={Text.FontSize.s900} fontWeight={Text.FontWeight.bold} textAlign='center'>
				{errorHeader ? errorHeader : "Error Loading this Screen!"}
			</Text>

			<Text fontSize={Text.FontSize.s600} fontWeight={Text.FontWeight.regular} textAlign='center'>
				{errorMessage} 
			</Text>
		</Flex>
	</Flex>
)