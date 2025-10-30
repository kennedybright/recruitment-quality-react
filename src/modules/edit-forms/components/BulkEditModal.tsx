import { aliasTokens } from "@nielsen-media/maf-fc-foundation"
import { FC, useState } from "react"
import { BulkValueInput } from "../styles"
import Flex from "@nielsen-media/maf-fc-flex"
import Text from "@nielsen-media/maf-fc-text"
import { CHECKBOXOPTIONS, EditField } from "../base/constants"
import { ColumnDef, OnDataChange, TableData, TableInstanceRef } from "@nielsen-media/maf-fc-table2"
import Modal from "@nielsen-media/maf-fc-modal"
import { useDataContext } from "../../../lib/context/data.context"
import BulkEditSelect from "./BulkEditSelect"
import { useEditContext } from "../base/edit.context"

interface BulkEditModalProps {
    tableColumns: ColumnDef<TableData>[] 
    editFields: EditField[]
    onDataChange: OnDataChange
    tableRef: TableInstanceRef<TableData>
}

export const BulkEditModal: FC<BulkEditModalProps> = ({ tableColumns, editFields, onDataChange, tableRef }) => {
    const { audioSMPScoring, dropdowns } = useDataContext()
    const { selectBulkEdit, setSelectBulkEdit } = useEditContext()

    // Create fields list for bulk change
    const bulkFieldsList = []
    editFields.forEach(field => {
        const column = tableColumns.find(col => col.id === field.label)
        if (column && field.type !== "scoring_text") bulkFieldsList.push({ label: column.header, value: field.label, type: field.type })
    })

    const [bulkField, setBulkField] = useState<string>(undefined)
    const [bulkNewValue, setBulkNewValue] = useState<any>(undefined)
    
    const onBulkDataChange = () => {
        setSelectBulkEdit(false)
        const selectedRows = tableRef.getSelectedRowModel().rows
        selectedRows.forEach((selected) => {
            const columnData = tableRef.getColumn(bulkField)
            onDataChange({row: selected, column: columnData, value: bulkNewValue})
        })
    }

    const resetBulkChange = () => {
        setSelectBulkEdit(false)
        setBulkField(undefined)
        setBulkNewValue(undefined)
    }

    return (
        <Modal
            buttons={[
                { 
                    children: 'Change',
                    variant: 'primary',
                    view: 'solid',
                    size: 'compact',
                    disabled: !bulkField || bulkNewValue === undefined,
                    onClick: onBulkDataChange
                },
                { 
                    children: 'Cancel',
                    variant: 'secondary',
                    view: 'outlined',
                    size: 'compact',
                    onClick: resetBulkChange
                }
            ]}
            onClose={resetBulkChange}
            opened={selectBulkEdit}
            title='Choose Field to Bulk Change:'
        >
            <Flex className="bulk-change" column gap={aliasTokens.space350}>
                <Text className="bulk-change-instructions" fontSize={Text.FontSize.s300} fontWeight={Text.FontWeight.regular}>
                    Choose the field you want to perform bulk change and enter the new value.
                </Text>
                <Flex className='bulk-change-select-btns' flexDirection='row' gap={0}>
                    <BulkEditSelect
                        type="field"
                        bulkField={bulkField}
                        items={bulkFieldsList.map(({label, value}) => ({ label, value }))}
                        onChange={(value) => {
                            console.log("bulk field to change: ", value)
                            setBulkField(value.toString())
                        }}
                    />

                    {/* Default Input Placeholder for Bulk Field Value */}
                    {!bulkField && (
                        <BulkValueInput
                            className='default-bulk-value'
                            layout="vertical"
                            variant='secondary'
                            // borderRadius='0px 9px 9px 0px'
                            readOnly
                        />
                    )}

                    {/* Dropdown Select Input for Bulk Field Value */}
                    {(bulkField && bulkFieldsList.find(field => field.value === bulkField)?.type === "scoring_dropdown") && ( 
                        <BulkEditSelect
                            type="field"
                            bulkField={bulkField}
                            items={audioSMPScoring}
                            onChange={(value) => {
                                console.log("bulk field to change: ", value)
                                setBulkNewValue(value.toString())
                            }}
                        />
                    )}

                    {/* Attribute Select Input for Bulk Field Value */}
                    {(bulkField && bulkFieldsList.find(field => field.value === bulkField)?.type === "form_attribute") && ( 
                        <BulkEditSelect
                            type="field"
                            bulkField={bulkField}
                            searchable={bulkField === "ri_id" ? true : false}
                            items={dropdowns[bulkField]}
                            onChange={(value) => {
                                console.log("bulk field to change: ", value)
                                setBulkNewValue(value.toString())
                            }}
                        />
                    )}

                    {/* Checkbox Select Input for Bulk Field Value */}
                    {(bulkField && bulkFieldsList.find(field => field.value === bulkField)?.type === "Checkbox") && ( 
                        <BulkEditSelect
                            type="field"
                            bulkField={bulkField}
                            items={CHECKBOXOPTIONS}
                            onChange={(value) => {
                                console.log("bulk field to change: ", value)
                                setBulkNewValue(value.toString() === "true" ? true : false)
                            }}
                        />
                    )}
                </Flex>
            </Flex>
        </Modal>
    )
}