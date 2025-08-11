// Formatting for the All Calls Monitored Report

import { FC, useEffect, useMemo, useState } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import Table2, { Table2Props, TableData, ColumnDef, NumberCellProps, TextCellProps } from '@nielsen-media/maf-fc-table2'
import { FlexDateRange, FlexTableHeader, FlexView } from '../styles'
import { aliasTokens, JSONObject } from '@nielsen-media/maf-fc-foundation'
import { AdjustmentBarContextStates, FilterItem, FilterOperator } from '@nielsen-media/maf-fc-adjustment-bar'
import { RangeDatePicker } from '@nielsen-media/maf-fc-date-picker'
import { PartialPickerDate, OnChangeHandler } from '@nielsen-media/maf-fc-date-picker/dist/types/src/types'
import { InformationOutlineIcon, SelectionsIcon } from '@nielsen-media/maf-fc-icons'
import AdjustCSS from '../../../../lib/utils/adjustCSS'
import ActionIcon from '@nielsen-media/maf-fc-action-icon'
import { useDataContext } from '../../../../lib/context/data.context'
import { InlineSpinner } from '@nielsen-media/maf-fc-spinner'
import { DownloadCsvButton } from '../../../../lib/components/buttons/DownloadButton'
import { useMakeTable } from '../../../../lib/utils/custom-hooks/table.hooks'
import { FETCHSTATUS, isEmpty } from '../../../../lib/utils/helpers'
import { matchesDateRange, matchesFilters } from '../../../../lib/utils/reports/validateReport'
import { useACM } from '../../../../lib/maf-api/hooks/report.hooks'
import { EmptyQAFormState } from '../../../../lib/components/feedback/EmptyQALoadState'
import { formatPickerAsDate } from '../../../../lib/utils/formatDateTime'
import AudioSMPQAForm from '../../../../modules/qaforms/screens/audio-smp/components/FormAudioSMP'

interface ACMTableProps<T> extends Partial<Table2Props<T>> {
    reportData: T[]
}

const ACMTable = <T,>({reportData, ...props}: ACMTableProps<T>) => {
    const { formFields } = useDataContext()
    const audioFormFields = formFields[1001]

    // Creating the Column Props for the Editable Table Data
    const extensions = {
        [Table2.ColumnExtensions.filter]: ({ columnId }) => columnId === setFilterValue({ opened: true, filterColumnId: columnId }),
        [Table2.ColumnExtensions.sortAZ]: true,
        [Table2.ColumnExtensions.sortZA]: true
    }
    const { NumberCell, TextCell } = Table2.Cells

    const defaultColProps = { // for default text columns
        meta: { textAlign: 'left' }, 
        cell: TextCell as FC<TextCellProps>
    } as unknown as Partial<ColumnDef<TableData>>

    const notesColProps = { // for text columns with large text (eg. comments fields) 
        size: 300,
        minSize: 150,
        maxSize: 500,
        cell: TextCell as FC<TextCellProps>
    } as unknown as Partial<ColumnDef<TableData>>

    const checkboxColProps = { // for checkbox columns with boolean values (eg. live call, do not print) 
        meta: { textAlign: 'left' },
        cell: ({ getValue }) => {
            const value = getValue() as boolean 
            return value ? "Yes" : "No"
        }
    } as unknown as Partial<ColumnDef<TableData>>

    const sampleIDColProps = { // Sample ID column
        cell: NumberCell as FC<NumberCellProps>
    } as unknown as Partial<ColumnDef<TableData>>

    const dropdownColProps = { // for scoring dropdown columns (eg. question order, foot in the door, etc.)
        meta: { 
            disableSorting: true, 
            textAlign: 'right' 
        },
        cell: NumberCell as FC<NumberCellProps>
    } as unknown as Partial<ColumnDef<TableData>>

    const columnPropsList: {id: string, props: Partial<ColumnDef<TableData>>}[] = 
        reportData.length > 0
            ? Object.keys(reportData[0]).map((key) => {
                const column = audioFormFields.find(field => field.label === key)
                if (column) {
                    if (column.label === "sample_id") return { id: key, props: sampleIDColProps }
                    if (column.fieldType === "Text") return { id: key, props: notesColProps }
                    if (column.fieldType === "Dropdown") return { id: key, props: dropdownColProps }
                    if (column.fieldType === "Checkbox") return { id: key, props: checkboxColProps }
                }

                // return default uneditable column props 
                return { id: key, props: defaultColProps }
            })
            : []

    // ------------------------------------------------------------------------------- //
    
    // Generate the table data and columns
    const { data, columns } = useMakeTable({ initData: reportData, extensions: extensions, columnProps: columnPropsList })
    const [tableColumns, setTableColumns] = useState<ColumnDef<TableData>[]>(columns) // rendered table columns

    // ------------------------------------------------------------------------------- //

    // useStates for the Adjustment Bar
    const [filterValue, setFilterValue] = useState({opened: false, filterColumnId: ''}) // filter bar state
    const [filterBarData, setFilterBarData] = useState<typeof data>(undefined) // filtered data from the Adjustment Bar

    // useStates for the Date Range Picker
    const [dates, setDates] = useState<[PartialPickerDate, PartialPickerDate]>([undefined, undefined]) 

    const handleDateRangeChange: OnChangeHandler = (({ value }: { value: [PartialPickerDate, PartialPickerDate]}) => {
        setDates(value)
    })

    const handleDateRangeReset = () => { setDates([undefined, undefined]) }

    const handleAdjustmentBarChange: (state?: AdjustmentBarContextStates) => void = state => {
        const { filters, operator } = state?.filtersState || {}
        const enabledFilters = filters.filter(f => f["value"] !== "") // filter out empty search filters
        if (isEmpty(enabledFilters.filter(Boolean))) return setFilterBarData(undefined)

        const filteredTableData = data.filter(item => { matchesFilters(item, enabledFilters as FilterItem[], operator as FilterOperator) })
        setFilterBarData(filteredTableData)

        setTableColumns(
            columns.filter((column: JSONObject) =>
                state?.layoutState
                    ? state.layoutState.find(layout => layout.fieldId === column.accessorKey && layout.selected)
                    : column
            )
        )
    }

    // Calculate the final table data results between the Date Range Picker & Adjustment Bar
    const tableData = useMemo(() => {
        // filtered date data
        let filteredData = dates[0] && dates[1] ? data.filter((item) => { return matchesDateRange(item, dates) }) : data

       if (filterBarData) filteredData = isEmpty(filterBarData) ? [] : filteredData.filter((item) => 
            filterBarData.some((filteredItem) => filteredItem.id === item.id)
        )
        
        return filteredData
    }, [data, filterBarData])

    return (
        <Flex column gap={aliasTokens.space350}>
            <FlexDateRange className='acm-choose-date-range' column gap={aliasTokens.space350}>
                <Text className='acm-date-range-filter-label' fontSize='s300' fontWeight='semiBold'>
                    Choose Date Range
                </Text>
                <RangeDatePicker.Input
                    className='acm-date-range'
                    size="compact"
                    minDate={new Date().setMonth(new Date().getMonth() - 6, 1)} // last 6 months
                    view={RangeDatePicker.View.double}
                    dateFormat="dd MMM yyyy"
                    data-selector='record_date'
                    clearable
                    helpText="Select a date range to filter results. By default, data is limited to the last 6 months."
                    value={dates}
                    onSubmit={handleDateRangeChange}
                    onClear={handleDateRangeReset}
                />
            </FlexDateRange>
            <Table2
                {...props}
                className='acm-full-table'
                columns={tableColumns}
                data={tableData}
                pagination={{currentPage: 0, pageSize: 25}}
                striped
                size='compact'
                resizable
                pinning={{ columns: { left: ['record_number'] } }}
                placeholderProps={{
                    icon: SelectionsIcon,
                    title: 'No Data Available',
                    description: 'There are no records to display. Try adjusting your filters or check back later.'
                }}
                expanding={{
                    renderSubComponent: ({ row }) => <AudioSMPQAForm mode='readonly' formID={row.original.record_number} readonlyData={row.original} />
                }}
            >
                <Table2.Header className='acm-table-header'>
                    <FlexTableHeader className='acm-table-header-btns' flexDirection='row' gap={aliasTokens.space200} justifyContent='flex-end'>
                        <Table2.AdjustmentBar
                            {...props}
                            className='acm-table-adjustmentbar'
                            hasSort={false}
                            hasSearch={false}
                            hasFilters
                            hasReset
                            hasLayout
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
                            onReset={() => setFilterBarData(undefined)}
                        />
                        <DownloadCsvButton 
                            classPfx="acm"
                            filename={dates[0] && dates[1]
                                ? `ACM - ${new Date(dates[0]).toISOString().split('T')[0]}_to_${new Date(dates[1]).toISOString().split('T')[0]}.csv`
                                : `acm_report.csv` // dummy filename for undefined dates
                            }
                            data={tableData}
                        />
                    </FlexTableHeader>
                </Table2.Header>
            </Table2>
        </Flex>
    )
}

export const ACMReport: FC = () => {
    const { formFields } = useDataContext() // Get QA Form Fields lists

    const [status, setStatus] = useState<FETCHSTATUS>('loading')

    const { data: acmData, isLoading, isError, isSuccess } = useACM({afterDate: formatPickerAsDate(new Date().setMonth(new Date().getMonth() - 6))}) // last 6 Months only

    useEffect(() => { // check if all static & report data has been loaded
        if (!formFields) {
            setStatus('loading')
            return
        }

        const allListsHaveData = Object.values(formFields).every((list) => !isEmpty(list)) 
        if (!allListsHaveData) {
            setStatus('loading')
            return
        }
        
        if (isLoading) {
            setStatus('loading')
            return
        }

        if (isError) {
            setStatus('error')
            return
        }

        if (isSuccess) {
            setStatus('success')
            return
        }
    }, [formFields, acmData, isLoading, isError, isSuccess])

    return (
        <FlexView className='all-calls-monitored' column gap={aliasTokens.space350}>
            <AdjustCSS // adjust table header's axis distribution
                tag='div'
                attribute='data-anchor'
                searchValue='table-header'
                style={{justifyContent: "flex-end"}}
            />
            <AdjustCSS // adjust layout menu height
                tag='div'
                attribute='data-selector'
                searchValue='adjustment-bar-layout__menu'
                style={{height: "350px"}}
            />
            <Flex className='acm-header' flexDirection='row' gap={aliasTokens.space400}>
                <Text className="acm-title" fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold}>
                    All Calls Monitored Report
                </Text>
                <ActionIcon
                    className="acm-info-tooltip"
                    disableHoverEffect
                    color={aliasTokens.color.primary600}
                    size="regular"
                    icon={InformationOutlineIcon}
                    tooltip="
                        The All Calls Monitored Report provides a comprehensive breakdown of every call monitored by QRs within 
                        the last 6 months. This report includes a complete view of monitoring activity, helping to assess
                        call quality and identify trends in RI performance.
                    "
                />
            </Flex>
            <InlineSpinner loading={status === 'loading'} isFillParent>
                {status === 'error' && <EmptyQAFormState size='regular' title="Error Occured" error description="An error occured when fetching the data." />}
                {status === 'success' && <ACMTable className='acm-report' reportData={acmData} />}
            </InlineSpinner>
        </FlexView>
    )
}