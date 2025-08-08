import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import { FlexLoading } from '../../shared.styles'
import { InlineSpinner } from '@nielsen-media/maf-fc-spinner'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'

interface LoaderProps {
  id: string
  loaderText?: string
}

// Global Loading component
export const Loading = ({id, loaderText}: LoaderProps) => (
    <Flex id={id} className="loader" column alignItems='center' justifyContent='center'>
        <FlexLoading column gap={aliasTokens.space300}>
            <InlineSpinner aria-label="Loading" loading isFillParent/>
            {loaderText && <Text textAlign='center' fontWeight='regular' fontSize='s300'>{loaderText}</Text>}
        </FlexLoading>
    </Flex>
)