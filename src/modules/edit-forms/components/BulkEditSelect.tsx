import { FC } from "react"
import { SingleSelectProps } from "@nielsen-media/maf-fc-select"
import { BulkFieldSelect, BulkValueSelect } from "../styles"

interface BulkEditSelectProps extends SingleSelectProps {
    type: 'field' | 'value'
    bulkField: string
}

const BulkEditSelect: FC<BulkEditSelectProps> = ({
    type,
    bulkField,
    ...props
}) => {
    if (type === 'field') return (
        <BulkFieldSelect
            {...props}
            className={`bulk-select__${bulkField.replaceAll("_", "-")}`}
            placeholder='Select Field'
            searchable
            required
            variant='primary'
            borderRadius='9px 0px 0px 9px'
            allowReselect
            selectedValue={bulkField}
        />
    )

    return (
        <BulkValueSelect
            {...props}
            className={`bulk-edit__${bulkField.replaceAll("_", "-")}`}
            data-selector={bulkField}
            required
            variant='secondary'
            allowReselect
            borderRadius='0px 9px 9px 0px'
            selectedValue={bulkField}
        />
    )
}

export default BulkEditSelect