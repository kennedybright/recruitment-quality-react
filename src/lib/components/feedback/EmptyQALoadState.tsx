import { FC } from 'react'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FlexFormTop } from '../../../modules/qaforms/styles'
import EmptyState, { EmptyStateProps } from '@nielsen-media/maf-fc-empty-state'
import { ErrorOutlineIcon } from '@nielsen-media/maf-fc-icons'

interface EmptyQAStateProps extends EmptyStateProps {
    error?: boolean
} 

export const EmptyQAFormState: FC<EmptyQAStateProps> = ({error, ...props}) => {
    return (
        <FlexFormTop className="empty-qa-state" column gap={aliasTokens.space500}>
            <EmptyState 
                {...props}
                size={props.size ?? "jumbo"}
                description={props.description}
                icon={{
                    props: {
                        icon: ErrorOutlineIcon,
                        variant: error ? 'danger' : 'neutral'
                    }
                }}  
            />
        </FlexFormTop>
    )
}