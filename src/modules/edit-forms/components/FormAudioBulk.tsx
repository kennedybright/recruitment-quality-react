// Test using RI: T345 && Record Date: Jul 2 2025

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Flex from '@nielsen-media/maf-fc-flex'
import Table2, { TableData, ColumnDef, SelectionItem, EditableAsyncSelectCellProps, RowData, 
  Cell, OnDataChange, TableInstanceRef } from '@nielsen-media/maf-fc-table2'
import { FlexTableHeader } from '../../analytics/operations/styles'
import { aliasTokens, JSONObject } from '@nielsen-media/maf-fc-foundation'
import { AdjustmentBarContextStates, FilterItem, FilterOperator } from '@nielsen-media/maf-fc-adjustment-bar'
import { DeleteOutlineIcon, EditIcon, ResetIcon } from '@nielsen-media/maf-fc-icons'
import AdjustCSS from '../../../lib/utils/adjustCSS'
import { useEditContext } from '../base/edit.context'
import { useMAFContext } from '../../../maf-api'
import { useDataContext } from '../../../lib/context/data.context'
import Button from '@nielsen-media/maf-fc-button'
import { useMakeColumns, useMakeData } from '../../../lib/utils/custom-hooks/table.hooks'
import { AUDIOSMP } from '../../qaforms/base/constants'
import { CHECKBOXOPTIONS, EditField } from '../base/constants'
import { BulkEditModal } from './BulkEditModal'
import { getAlphaNumType, sanitizeAlphaNumeric } from '../../../lib/utils/helpers'

const QAFormBulkEditableAudio = () => {
    const { dropdowns, formFields, audioSMPScoring } = useDataContext() // Get all dropdown and form fields lists 
    const { selectors: { useUIToggles } } = useMAFContext()
    // UI toggle indication for bulk delete permissions
    const canDelete = useUIToggles("CCQA_EDITFORMS_DELETE")
    const { originalFormData, forms, updateBulkFormChange, formErrors, setSelectBulkEdit, clearAllEdits } = useEditContext()
    const fields = formFields[1001]
    
    // ------------------------------------------------------------------------------- //
    
    // Creating the Column Props for the Editable Table Data
    const extensions = {
        [Table2.ColumnExtensions.filter]: ({ columnId }) => columnId === setFilterValue({ opened: true, filterColumnId: columnId }),
        [Table2.ColumnExtensions.sortAZ]: true,
        [Table2.ColumnExtensions.sortZA]: true
    }

    const defaultPinnedColumns = {
        columns: canDelete 
            ? { left: ['record_number'], right: ['delete'] } 
            : { left: ['record_number'] }
    }

    const { TextCell, ActionIconCell } = Table2.Cells
    const { EditableGroupTextCell, EditableSelectCell, EditableTextCell, EditableSingleDatePickerCell } = Table2.EditableCells

    // load all fields available to perform edit change actions
    const uneditableFields = ["record_number", "app_id", "qr_id", "created_by", "created_date", "updated_by", "updated_date"]
    const editableFields: EditField[] = fields
        .filter(field => !uneditableFields.includes(field.label))
        .map((field) => { return { label: field.label, type: field.fieldType } })

    const uneditableColProps = { // for uneditable columns
        cell: TextCell
    } as unknown as Partial<ColumnDef<TableData>>

    //   const editableDateColProps = { // Record Date editable column
    //     meta: { editable: true },
    //     minSize: 500,
    //     cell: EditableGroupTextCell
    //   } as unknown as Partial<ColumnDef<TableData>>

    //   const editableTimeColProps = { // Record Time editable column
    //     meta: { editable: true },
    //     minSize: 500,
    //     cell: EditableGroupTextCell
    //   } as unknown as Partial<ColumnDef<TableData>>

    const editableAudioSMPColProps = { // for Audio/SMP dropdown column
        meta: { editable: true },
        cell: (params: EditableAsyncSelectCellProps) => (
            <EditableSelectCell
                {...params}
                getItems={() => AUDIOSMP}
            />
        )
    } as unknown as Partial<ColumnDef<TableData>>

    const getEditableDropdownColProps = (name: string) => { // for editable dropdown columns with select (eg. ri, calltype, frame code, etc.)
        return {
            meta: { 
                editable: true ,
                validate: (cell: Cell<RowData, any>) => { // Validate form attribute errors (call type, frame code)
                    if (name === "call_type_id") return (cell.row.original["audio_smp"] === "SMP" && ["FL", "SP"].includes(cell.getValue()))
                        && 'Invalid Calltype'
                    if (name === "frame_code_id") return (
                        (cell.row.original["audio_smp"] === "Audio" && cell.getValue() === "TV") || 
                        (cell.row.original["audio_smp"] === "SMP" && cell.getValue() !== "TV")
                    ) && 'Invalid Framecode'
                    return
                },
            },
            cell: (params: EditableAsyncSelectCellProps) => (
                <EditableSelectCell
                    {...params}
                    getItems={() => name === 'mca_category' 
                        ? [{label: "\u2014", value: null}, ...dropdowns.mca_category]
                        : dropdowns[name]}
                />
            )
        } as unknown as Partial<ColumnDef<TableData>>
    }

    const editableSampleIDColProps = { // for Sample ID input column
        meta: { 
            editable: true, 
            validate: (cell: Cell<RowData, any>) => {
                const value = cell.getValue()
                return (value?.length > 0 && !/^[0-9]+$/.test(value)) && 'Sample ID must be a numeric value.'
            }
        },
        cell: (params: EditableAsyncSelectCellProps) => (
            <EditableTextCell
                {...params}
                formatValue={(value) => {
                    console.log("sampleID type", getAlphaNumType(value))
                    return getAlphaNumType(value) === 0 ? +sanitizeAlphaNumeric(value) : sanitizeAlphaNumeric(value)}}
            />
        )
    } as unknown as Partial<ColumnDef<TableData>>

    const editableCheckboxColProps = { // for editable checkbox columns (eg. live call, inaccurate data, etc.)
        meta: { editable: true },
        cell: (params: EditableAsyncSelectCellProps) => (
            <EditableSelectCell
                {...params}
                formatValue={value => `${value}`}
                getItems={() => CHECKBOXOPTIONS}
            />
        )
    } as unknown as Partial<ColumnDef<TableData>>

    const editableScoringColProps = { // for editable dropdown columns (eg. question order, foot in the door, etc.)
        meta: { editable: true },
        cell: (params: EditableAsyncSelectCellProps) => (
            <EditableSelectCell
                {...params}
                getItems={() => [{label: "\u2014", value: null}, ...audioSMPScoring]}
            />
        )
    } as unknown as Partial<ColumnDef<TableData>>

    const editableNotesColProps = { // for editable columns with large text (eg. comments fields)
        meta: { editable: true },
        minSize: 500,
        cell: EditableGroupTextCell
    } as unknown as Partial<ColumnDef<TableData>>

    const getDeleteIconColProps = (setTrashedDataIds: Function) => ({
        header: (props: JSONObject) => <ActionIconCell {...props} icon={DeleteOutlineIcon} />,
        accessorKey: 'delete',
        size: 80,
        minSize: 80,
        maxSize: 80,
        meta: {
            disableSorting: true,
            textAlign: 'center' as const,
        },
        cell: (props: JSONObject) => (
            <ActionIconCell
                {...props}
                icon={DeleteOutlineIcon}
                onClick={() => {
                    setTrashedDataIds((old: JSONObject) => ({ ...old, [props.cell.row.original.record_number]: true }))
                    if (selectedIds) setSelectedIds(
                        Object.fromEntries(
                            Object.entries(selectedIds).filter(([id, value]) => id !== props.cell.row.id)//original.record_number)
                        )
                    )
                    updateBulkFormChange(props.cell.row.original.record_number, null, "FORM DELETED")
                }}
            />
        ),
    })

    const columnPropsList: {id: string, props: Partial<ColumnDef<TableData>>}[] = 
        Object.keys(originalFormData[0]).map((key) => {
            const editableCol = editableFields.find(field => field.label === key)
            if (editableCol) {
                if (editableCol.label === "audio_smp") return { id: key, props: editableAudioSMPColProps }
                if (editableCol.label === "sample_id") return { id: key, props: editableSampleIDColProps }
                if (editableCol.type === "form_attribute") return { id: key, props: getEditableDropdownColProps(key) }
                if (editableCol.label === "mca_category") return { id: key, props: getEditableDropdownColProps("mca_category") }
                if (editableCol.label === "disposition") return { id: key, props: getEditableDropdownColProps("disposition") }
                if (editableCol.type === "scoring_dropdown") return { id: key, props: editableScoringColProps }
                if (editableCol.type.includes("checkbox")) return { id: key, props: editableCheckboxColProps }
                if (editableCol.type === "scoring_text") return { id: key, props: editableNotesColProps }
            }

            // return default uneditable column props 
            return { id: key, props: uneditableColProps }
        })

    // ------------------------------------------------------------------------------- //

    // useStates for the Deletion Icon
    const [trashedDataIds, setTrashedDataIds] = useState<JSONObject<string>>({})
    
    // Generate the table data and columns
    const data = useMemo(() => {return useMakeData(forms)}, [forms])
    const columns = useMemo(() => { // update column props list with delete icon
        const columnProps = useMakeColumns(forms, extensions, columnPropsList)
        return canDelete ? [...columnProps, getDeleteIconColProps(setTrashedDataIds)] : columnProps
    }, [])
    const [tableColumns, setTableColumns] = useState<ColumnDef<TableData>[]>(columns) // rendered table columns
    const tableRef = useRef<TableInstanceRef<TableData>>() // exposing table instance reference
    const table = tableRef.current

    // ------------------------------------------------------------------------------- //

    // useStates for the Selection Bar
    const [selectedIds, setSelectedIds] = useState<JSONObject<boolean>>(null)
    const getSelectedRowsData = useCallback(() =>
        data.reduce((acc: SelectionItem[], record) => {
            if (selectedIds) {
                if (selectedIds[record.id]) {
                    acc.push({
                        id: record.id,
                        label: record.record_number,
                    })
                }
                return acc
            }
            return []
        }, [])
    , [data, selectedIds])
    
    console.log("selected", selectedIds)
    const [selectedRowsData, setSelectedRowsData] = useState(getSelectedRowsData())
    useEffect(() => { setSelectedRowsData(getSelectedRowsData()) }, [selectedIds, getSelectedRowsData])

    const handleSelectionBarDelete: (selections: SelectionItem[]) => void = selections => {
        setTrashedDataIds((old: JSONObject) => ({...old, ...selections.reduce((acc, selection) => ({ ...acc, [selection.label]: true }), {})}))
        setSelectedIds(null)
        selections.forEach((selection) => updateBulkFormChange(+selection.label, null, "FORM DELETED"))
    }

    const handleSelectionBarChange: (selections: SelectionItem[]) => void = selections => {
        console.log("selections", selections, selections.reduce((acc, selection) => ({ ...acc, [selection.label]: true }), {}))
        setSelectedIds(selections.reduce((acc, selection) => ({ ...acc, [selection.id]: true }), {}))
    }

    // ------------------------------------------------------------------------------- //

    // useStates for the Adjustment Bar
    const [filterValue, setFilterValue] = useState({opened: false, filterColumnId: ''}) // filter bar state
    const [filterBarData, setFilterBarData] = useState<TableData[]>(undefined) // filtered data from the Adjustment Bar

    const matchesFilters = <T,>(item: T, filters: FilterItem[], operator: FilterOperator): boolean => {
        const filterCheck = ({ fieldId, value }: FilterItem) => {
            const fieldValue = `${item[fieldId as keyof T] ?? ''}`.toLowerCase()
            return fieldValue.includes(value?.toLowerCase())
        }

        if (!filters) return true
        switch (operator) {
            case FilterOperator.OR:
                return filters.some(filterCheck)
            default:
                return filters.every(filterCheck)
        }
    }

    const handleAdjustmentBarChange: (state?: AdjustmentBarContextStates) => void = state => {
        const { filters, operator } = state?.filtersState || {}
        const enabledFilters = filters.filter(f => f["value"] !== "") // filter out empty search filters
        if (enabledFilters.filter(Boolean).length === 0) return setFilterBarData(undefined)
        
        const filteredTableData = data.filter(item => { return (matchesFilters(item, enabledFilters as FilterItem[], operator as FilterOperator)) })
        setFilterBarData(filteredTableData)
        
        setSelectedIds((prevIDs) => { // remove filtered out selections
            if (prevIDs) {
                const filterBarIDs = filteredTableData.map(obj => obj.id)
                const filteredIDs = Object.keys(prevIDs).filter(id => filterBarIDs.includes(Number(id)))
                return filteredIDs ? filteredIDs.reduce((acc, id) => ({ ...acc, [id]: true }), {}) : {}
            }
            return prevIDs
        })

        setTableColumns(
            columns.filter((column: JSONObject) =>
                state?.layoutState
                ? state.layoutState.find(layout => layout.fieldId === column.accessorKey && layout.selected)
                : column
            )
        )
    }

    const handleDataChange: OnDataChange = (({ row, column, value}) => {
        console.log("onDataChange // row, column, value: ", row, column, value)
        updateBulkFormChange(row.original.record_number, column.id, value)

        // auto-populate RI's site name
        if (column.id === "ri_id") updateBulkFormChange(row.original.record_number, 'site_name_id', dropdowns.ri_id.find(ri => ri.label === value.toString())?.siteNameID)
    })

    // ------------------------------------------------------------------------------- //

    // Calculate the final table data results
    const tableData = useMemo(() => {
        let filteredData = data.filter(item => !trashedDataIds[item.record_number])
        if (filterBarData?.length === 0) filteredData = []
        else if (filterBarData?.length) filteredData = filterBarData

        return filteredData
    }, [data, trashedDataIds, filterBarData])

    return (
        <Flex column gap={aliasTokens.space350}>
            <AdjustCSS // adjust layout menu height
                tag='div'
                attribute='data-selector'
                searchValue='adjustment-bar-layout__menu'
                style={{height: "350px"}}
            />
            <Table2
                className='form-edits-table'
                columns={tableColumns}
                data={tableData}
                pagination={{currentPage: 0, pageSize: 25}}
                striped
                size='compact'
                resizable
                pinning={defaultPinnedColumns}
                selection={{
                    rowIds: selectedIds,
                    onRowSelectionChange: setSelectedIds
                }}
                onDataChange={handleDataChange}
                tableInstanceRef={tableRef}
            >
                <Table2.Header className='form-edits-table-header' title='Bulk Edit Multiple QA Forms'>
                    <FlexTableHeader className='form-edits-table-header-btns' flexDirection='row' gap={aliasTokens.space600} justifyContent='flex-end'>
                        <Table2.AdjustmentBar
                            className='edits-table-adjustmentbar'
                            hasSort={false}
                            hasSearch={false}
                            hasFilters
                            hasReset
                            hasLayout={false}
                            fieldsList={columns.map((column: JSONObject) => ({
                                id: column.accessorKey,
                                label: column.header,
                            }))}
                            layoutList={columns.map((column: JSONObject) => ({
                                fieldId: column.accessorKey,
                                selected: true,
                            }))}
                            filterOpened={filterValue}
                            onChange={handleAdjustmentBarChange}
                        />
                        <Table2.SelectionBar
                            className='edits-table-selectionbar'
                            selections={selectedRowsData}
                            editButton={{
                                icon: EditIcon,
                                label: 'Edit'
                            }}
                            deleteButton={canDelete ? {
                                icon: DeleteOutlineIcon,
                                label: 'Delete'
                            } : undefined}
                            hasEdit
                            hasDelete={canDelete}
                            onChange={handleSelectionBarChange}
                            onDelete={handleSelectionBarDelete}
                            onEdit={() => setSelectBulkEdit(true)}
                        />
                        <Button 
                            className='exit'
                            type='button'
                            variant='tertiary'
                            size='compact'  
                            view='outlined'
                            aria-label='page-top-exit'
                            roundedCorners='all'
                            icon={{
                                icon: ResetIcon,
                                iconPosition: 'left'
                            }}
                            onClick={() => {
                                clearAllEdits()
                                setFilterBarData(undefined)
                                setSelectedIds(null)
                                setTrashedDataIds({})
                            }}
                        >
                            Reset All Changes
                        </Button>
                    </FlexTableHeader>
                </Table2.Header>

                {/* Bulk Edit Modal */}
                <BulkEditModal
                    tableColumns={tableColumns}
                    editFields={editableFields}
                    onDataChange={handleDataChange}
                    tableRef={table}
                />
            </Table2>
        </Flex>
    )
}

export default QAFormBulkEditableAudio