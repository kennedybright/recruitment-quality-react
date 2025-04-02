// Test using RI: G1927 && Record Date: Nov 17 2024

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import Table2, { TableData, ColumnDef, SelectionItem, EditableAsyncSelectCellProps, RowData, 
  Cell, OnDataChange, TableInstanceRef } from '@nielsen-media/maf-fc-table2'
import { FlexTableHeader } from '../../analytics/operations/styles'
import { aliasTokens, JSONObject } from '@nielsen-media/maf-fc-foundation'
import { AdjustmentBarContextStates, FilterItem, FilterOperator } from '@nielsen-media/maf-fc-adjustment-bar'
import { useMakeColumns, useMakeData } from '../../../lib/utils/qa-reports'
import { DeleteOutlineIcon, EditIcon, ResetIcon } from '@nielsen-media/maf-fc-icons'
import AdjustCSS from '../../../lib/utils/adjust-css'
import { useEditContext } from './edits'
import { useMAFContext } from '../../../maf-api'
import Modal from '@nielsen-media/maf-fc-modal'
import { useDataContext } from '../../../lib/context/static-data'
import Button from '@nielsen-media/maf-fc-button'
import { BulkFieldSelect, BulkValueInput, BulkValueSelect } from '../styles'

const QAFormBulkEditableAudio = () => {
  const { dropdowns, formFields, audioSMPScoring } = useDataContext() // Get all dropdown and form fields lists 
  const fields = formFields[1001]
  const { selectors: { useUIToggles } } = useMAFContext()
  // UI toggle indication for bulk delete permissions
  const canDelete = false //useUIToggles("CCQA_EDITFORMS_DELETE")
  const { originalFormData, forms, updateBulkFormChange, formChanges, setFormChanges, setForms } = useEditContext()
  
  // ------------------------------------------------------------------------------- //
  
  // Creating the Column Props for the Editable Table Data
  const extensions = {
    [Table2.ColumnExtensions.filter]: ({ columnId }) => columnId === setFilterValue({ opened: true, filterColumnId: columnId }),
    [Table2.ColumnExtensions.sortAZ]: true,
    [Table2.ColumnExtensions.sortZA]: true
  }

  const defaultPinnedColumns = {
    columns: 
      canDelete 
      ? { left: ['record_number'], right: ['delete'] } 
      : { left: ['record_number'] }
  }

  const { TextCell } = Table2.Cells
  const { EditableGroupTextCell, EditableSelectCell, EditableTextCell } = Table2.EditableCells

  // load all fields available to perform edit change actions
  const uneditableFieldTypes = ["Autopopulated", "STRING", "Audit", "BOOLEAN"]
  const editableFields = fields
    .filter(field => !uneditableFieldTypes.includes(field.fieldType))
    .map((field) => { return { label: field.label, type: field.fieldType } })

  const uneditableColProps = { // for uneditable columns
    cell: TextCell
  } as unknown as Partial<ColumnDef<TableData>>

  const editableNotesColProps = { // for editable columns with large text (eg. comments fields)
    meta: { editable: true },
    minSize: 500,
    cell: EditableGroupTextCell
  } as unknown as Partial<ColumnDef<TableData>>

  const sampleIDColProps = { // Sample ID input column
    meta: { 
      editable: true, 
      validate: (cell: Cell<RowData, any>) => {
        const value = cell.getValue()
        return (value?.length > 0 && !/^[0-9]+$/.test(value)) && 'Sample ID must be a numeric value.'
      }
    },
    cell: EditableTextCell
  } as unknown as Partial<ColumnDef<TableData>>

  const editableFramecodeColProps = { // for Frame Code dropdown column
    meta: { editable: true },
    cell: (params: EditableAsyncSelectCellProps) => (
      <EditableSelectCell
        {...params}
        getItems={() => dropdowns.frame_code_id}
      />
    )
  } as unknown as Partial<ColumnDef<TableData>>

  const editableCalltypeColProps = { // for Call Type dropdown column
    meta: { editable: true },
    cell: (params: EditableAsyncSelectCellProps) => (
      <EditableSelectCell
        {...params}
        getItems={() => dropdowns.call_type_id}
      />
    )
  } as unknown as Partial<ColumnDef<TableData>>

  const editableRIColProps = { // for RI dropdown column
    meta: { editable: true },
    cell: (params: EditableAsyncSelectCellProps) => (
      <EditableSelectCell
        {...params}
        searchable
        getItems={() => dropdowns.ri_id}
      />
    )
  } as unknown as Partial<ColumnDef<TableData>>

  const editableRIShiftColProps = { // for RI Shift dropdown column
    meta: { editable: true },
    cell: (params: EditableAsyncSelectCellProps) => (
      <EditableSelectCell
        {...params}
        getItems={() => dropdowns.ri_shift}
      />
    )
  } as unknown as Partial<ColumnDef<TableData>>

  const editableSitenameColProps = { // for Site Name dropdown column
    meta: { editable: true },
    cell: (params: EditableAsyncSelectCellProps) => (
      <EditableSelectCell
        {...params}
        getItems={() => dropdowns.site_name_id}
      />
    )
  } as unknown as Partial<ColumnDef<TableData>>

  const editableMcaCatgColProps = { // for MCA Category dropdown column
    meta: { editable: true },
    cell: (params: EditableAsyncSelectCellProps) => (
      <EditableSelectCell
        {...params}
        getItems={() => dropdowns.mca_category}
      />
    )
  } as unknown as Partial<ColumnDef<TableData>>

  const checkboxOptions = [ 
    {label: "Yes", value: true as unknown as "true"}, 
    {label: "No", value: false as unknown as "false"}
  ]
  const editableCheckboxColProps = { // for editable checkbox columns (eg. live call, inaccurate data, etc.)
    meta: { editable: true },
    cell: (params: EditableAsyncSelectCellProps) => (
      <EditableSelectCell
        {...params}
        formatValue={value => `${value}`}
        getItems={() => checkboxOptions}
      />
    )
  } as unknown as Partial<ColumnDef<TableData>>

  const editableDropdownColProps = { // for editable dropdown columns (eg. question order, foot in the door, etc.)
    meta: { editable: true },
    cell: (params: EditableAsyncSelectCellProps) => (
      <EditableSelectCell
        {...params}
        getItems={() => audioSMPScoring}
      />
    )
  } as unknown as Partial<ColumnDef<TableData>>

  const editableDispositionColProps = { // for Disposition column
    meta: { editable: true },
    cell: (params: EditableAsyncSelectCellProps) => (
      <EditableSelectCell
        {...params}
        getItems={() => dropdowns.disposition}
      />
    )
  } as unknown as Partial<ColumnDef<TableData>>

  const columnPropsList: {id: string, props: Partial<ColumnDef<TableData>>}[] = 
    Object.keys(originalFormData[0]).map((key) => {
      const editableCol = editableFields.find(field => field.label === key)
      if (editableCol) {
        if (editableCol.label === "sample_id") return { id: key, props: sampleIDColProps }
        if (editableCol.label === "ri_id") return { id: key, props: editableRIColProps }
        if (editableCol.label === "ri_shift") return { id: key, props: editableRIShiftColProps }
        if (editableCol.label === "call_type_id") return { id: key, props: editableCalltypeColProps }
        if (editableCol.label === "frame_code_id") return { id: key, props: editableFramecodeColProps }
        if (editableCol.label === "site_name_id") return { id: key, props: editableSitenameColProps }
        if (editableCol.label === "mca_category") return { id: key, props: editableMcaCatgColProps }
        if (editableCol.label === "disposition") return { id: key, props: editableDispositionColProps }
        if (editableCol.type === "Text") return { id: key, props: editableNotesColProps }
        if (editableCol.type === "Dropdown") return { id: key, props: editableDropdownColProps }
        if (editableCol.type === "Checkbox") return { id: key, props: editableCheckboxColProps }
      }

      // return default uneditable column props 
      return { id: key, props: uneditableColProps }
    })

  // ------------------------------------------------------------------------------- //
  
  // Generate the table data and columns
  const data = useMemo(() => {return useMakeData(forms)}, [forms])
  const columns = useMemo(() => { return useMakeColumns(forms, extensions, columnPropsList)}, [])
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
  , [selectedIds])

  const [selectedRowsData, setSelectedRowsData] = useState(getSelectedRowsData())
  useEffect(() => { setSelectedRowsData(getSelectedRowsData()) }, [selectedIds])

  const handleSelectionBarDelete: (selections: SelectionItem[]) => void = selections => {
    console.log("selection bar delete: ", selections)
  }

  const handleSelectionBarChange: (selections: SelectionItem[]) => void = selections => {
    setSelectedIds(
      selections
        .reduce((acc, selection) => ({ ...acc, [selection.id]: true }), {})
    )
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

  // Create fields list for bulk change
  const bulkFieldsList = []
  editableFields.forEach(field => {
    const column = tableColumns.find(col => col.id === field.label)
    if (column && field.type !== "Text") bulkFieldsList.push({ label: column.header, value: field.label, type: field.type })
  })

  const [bulkField, setBulkField] = useState<string>(undefined)
  const [bulkNewValue, setBulkNewValue] = useState<any>(undefined)
  const [bulkEditClicked, setBulkEditClicked] = useState<boolean>(false)

  const applyBulkEdit = (({ row, column, value }) => {
    console.log("applyBulkEdit // row, column, value: ", row, column, value)
    updateBulkFormChange(row.record_number, column.id, value)
  })
  
  const onBulkDataChange = () => {
    setBulkEditClicked(false)
    const selectedRows = table.getSelectedRowModel().rows
    selectedRows.forEach((selected) => {
      const rowData = selected.original
      const columnData = table.getColumn(bulkField)

      handleDataChange({row: selected, column: columnData, value: bulkNewValue})
    })
  }

  // Clear all form changes
  const clear = () => {
    setForms(originalFormData)
    setFormChanges([])
    setFilterBarData(undefined)
  }

  const resetBulkChange = () => {
    setBulkEditClicked(false)
    setBulkField(undefined)
    setBulkNewValue(undefined)
  }

  const tableData = useMemo(() => {
    let filteredData = data
    console.log("data: ", data)
    console.log("filterBarData: ", filterBarData)
    if (filterBarData?.length === 0) filteredData = []
    else if (filterBarData?.length) filteredData = filterBarData
    console.log("tableData: ", filteredData)
    return filteredData
  }, [data, filterBarData])
  
  console.log("Bulk mode // selections: ", selectedIds, selectedRowsData)
  console.log("Bulk mode // Form changes: ", formChanges)

  return (
    <Flex column gap={aliasTokens.space350}>
      <AdjustCSS // adjust layout menu height
        isBody={true}
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
              onEdit={() => setBulkEditClicked(true)}
            />
            <Button className='exit'
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
              onClick={clear}
            >
              Reset All Changes
            </Button>
          </FlexTableHeader>
        </Table2.Header>
      </Table2>

      {/* Bulk Change Modal */}
      {bulkEditClicked && (
        <Modal
          buttons={[
            { children: 'Change',
              variant: 'primary',
              view: 'solid',
              size: 'compact',
              disabled: !bulkField || !bulkNewValue,
              onClick: onBulkDataChange
            },
            { children: 'Cancel',
              variant: 'secondary',
              view: 'outlined',
              size: 'compact',
              onClick: resetBulkChange
            }
          ]}
          onClose={resetBulkChange}
          opened
          title='Choose Field to Bulk Change:'
        >
          <Flex className="bulk-change" column gap={aliasTokens.space350}>
            <Text className="bulk-change-instructions" fontSize={Text.FontSize.s300} fontWeight={Text.FontWeight.regular}>
              Choose the field you want to perform bulk change and enter the new value.
            </Text>
            <Flex className='bulk-change-select-btns' flexDirection='row' gap={0}>
              <BulkFieldSelect
                placeholder='Select Field'
                searchable
                required
                variant='primary'
                borderRadius='9px 0px 0px 9px'
                allowReselect
                items={bulkFieldsList.map(({label, value}) => ({ label, value }))}
                selectedValue={bulkField}
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
                  borderRadius='0px 9px 9px 0px'
                  readOnly
                />
              )}

              {/* Dropdown Select Input for Bulk Field Value */}
              {(bulkField && bulkFieldsList.find(field => field.value === bulkField)?.type === "Dropdown") && ( 
                <BulkValueSelect
                  className={`bulk-edit__${bulkField.replaceAll("_", "-")}`}
                  data-selector={bulkField}
                  required
                  variant='secondary'
                  allowReselect
                  borderRadius='0px 9px 9px 0px'
                  items={audioSMPScoring}
                  selectedValue={bulkField}
                  onChange={(value) => {
                    console.log("bulk field to change: ", value)
                    setBulkNewValue(value.toString())
                  }}
                />
              )}

              {/* Attribute Select Input for Bulk Field Value */}
              {(bulkField && bulkFieldsList.find(field => field.value === bulkField)?.type === "Attribute") && ( 
                <BulkValueSelect
                  className={`bulk-edit__${bulkField.replaceAll("_", "-")}`}
                  data-selector={bulkField}
                  required
                  variant='secondary'
                  allowReselect
                  searchable={bulkField === "ri_id" ? true : false}
                  borderRadius='0px 9px 9px 0px'
                  items={dropdowns[bulkField]}
                  selectedValue={bulkField}
                  onChange={(value) => {
                    console.log("bulk field to change: ", value)
                    setBulkNewValue(value.toString())
                  }}
                />
              )}

              {/* Checkbox Select Input for Bulk Field Value */}
              {(bulkField && bulkFieldsList.find(field => field.value === bulkField)?.type === "Checkbox") && ( 
                <BulkValueSelect
                  className={`bulk-edit__${bulkField.replaceAll("_", "-")}`}
                  data-selector={bulkField}
                  required
                  variant='secondary'
                  allowReselect
                  borderRadius='0px 9px 9px 0px'
                  items={checkboxOptions}
                  selectedValue={bulkField}
                  onChange={(value) => {
                    console.log("bulk field to change: ", value)
                    setBulkNewValue(value.toString() === "true" ? true : false)
                  }}
                />
              )}
            </Flex>
          </Flex>
        </Modal>
      )}
    </Flex>
  )
}

export default QAFormBulkEditableAudio