import { FC } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import { useEditContext } from './edit.context'
import Table2, { Table2Props } from '@nielsen-media/maf-fc-table2'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FlexFormChangesBody, FlexWrapperHeaderText } from '../styles'
import { useMakeTable } from '../../../lib/utils/custom-hooks/table.hooks'
import { FormChange } from '../../../lib/types/edit.types'
import { formatTableValue } from '../../../lib/utils/helpers'

interface FormEditsTableProps extends Partial<Table2Props<FormChange>> {
    changes: FormChange[]
}

const FormChangesTable: FC<FormEditsTableProps> = ({changes, ...props}) => {
    // convert boolean values to "Yes" or "No" string values and null values to "NULL" string values
    const updatedChanges = changes.map((change) => {
        return {
            ...change,
            old_value: formatTableValue(change.old_value), //typeof change.old_value === "boolean" ? `${change.old_value}` : change.old_value ?? "NULL",
            new_value: formatTableValue(change.new_value) //typeof change.new_value === "boolean" ? `${change.new_value}` : change.new_value ?? "NULL"
        }
    })

    // Generate the table data and columns
    const { data, columns } = useMakeTable({initData: updatedChanges})

    return (
        <Flex>
            <Table2
                className='form-edits-table'
                {...props}
                columns={columns}
                data={data}
                pagination={{currentPage: 0, pageSize: 50}}
                striped
                size='compact'
            />
        </Flex>
    )
}

const ReviewChanges = () => {
  const { editMode, form, formChanges } = useEditContext()

  return (
    <FlexFormChangesBody className='review-changes' column>
        <FlexWrapperHeaderText className='review-header'>
            {editMode === "single" && (
                <Flex gap={aliasTokens.space350}>
                    <Text className="form-title" externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold}>
                        Review Edits for Form:
                    </Text>
                    <Text className='form-number' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold} color={aliasTokens.color.primary600}>
                        {form.record_number}
                    </Text>
                </Flex>
            )}
            {editMode === "bulk" && (
                <Text className="form-title" externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold}>
                    Review Edits:
                </Text>
            )}
        </FlexWrapperHeaderText>
        {formChanges.length > 0 && <FormChangesTable className='form-changes' changes={formChanges} />}
    </FlexFormChangesBody>
  )
}

export default ReviewChanges