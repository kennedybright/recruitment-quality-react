// Formatting for the Last Call Monitored Report

import { FC, useMemo, useState } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import Table2, { ColumnDef, NumberCellProps, Table2Props, TableData, TextCellProps } from '@nielsen-media/maf-fc-table2'
import { useMakeTable } from '../../../../lib/utils/custom-hooks/table.hooks'
import { FlexTableHeader, FlexView } from '../styles'
import { aliasTokens, JSONObject } from '@nielsen-media/maf-fc-foundation'
import { AdjustmentBarContextStates, FilterItem, FilterOperator } from '@nielsen-media/maf-fc-adjustment-bar'
import { InformationOutlineIcon, SelectionsIcon } from '@nielsen-media/maf-fc-icons'
import AdjustCSS from '../../../../lib/utils/adjustCSS'
import ActionIcon from '@nielsen-media/maf-fc-action-icon'
import { InlineSpinner } from '@nielsen-media/maf-fc-spinner'
import { DownloadCsvButton } from '../../../../lib/components/buttons/DownloadButton'
import { ReportLCM } from '../../../../lib/types/reports.types'
import { matchesFilters } from '../../../../lib/utils/reports/validateReport'
import { useLCM } from '../../../../lib/maf-api/hooks/report.hooks'
import { isEmpty } from '../../../../lib/utils/helpers'
import { EmptyQAFormState } from '../../../../lib/components/feedback/EmptyQALoadState'

interface LCMTableProps extends Partial<Table2Props<ReportLCM>> {
    reportData: ReportLCM[]
}

const LCMTable: FC<LCMTableProps> = ({reportData, ...props}) => {
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

    const numberColProps = { // for numerical columns
        meta: { textAlign: 'right' },
        cell: NumberCell as FC<NumberCellProps>
    } as unknown as Partial<ColumnDef<TableData>>

    const columnPropsList: {id: string, props: Partial<ColumnDef<TableData>>}[] = 
        reportData.length > 0
            ? Object.keys(reportData[0]).map((key) => {
                if (["total_calls_monitored", "total_live_calls", "date_difference"].includes(key)) return { id: key, props: numberColProps }

                // return default uneditable column props 
                return { id: key, props: defaultColProps }
            })
            : []

    // ------------------------------------------------------------------------------- //

    // Generate the table data and columns
    const { data, columns } = useMakeTable({ initData: reportData, extensions: extensions, columnProps: columnPropsList })
    
    // ------------------------------------------------------------------------------- //
    
    // useStates for the Adjustment Bar
    const [filterValue, setFilterValue] = useState({opened: false, filterColumnId: ''}) // filter bar state
    const [filterBarData, setFilterBarData] = useState<TableData[]>(undefined) // filtered data from the Adjustment Bar

    const handleAdjustmentBarChange: (state?: AdjustmentBarContextStates) => void = state => {
        const { filters, operator } = state?.filtersState || {}
        const enabledFilters = filters.filter(f => f["value"] !== "") // filter out empty search filters
        if (isEmpty(enabledFilters.filter(Boolean))) return setFilterBarData(undefined)

        const filteredTableData = data.filter(item => { matchesFilters<ReportLCM>(item, enabledFilters as FilterItem[], operator as FilterOperator) })
        setFilterBarData(filteredTableData)
    }

    // Calculate the final table data results
    const tableData = useMemo(() => {
        let filteredData = data
        if (filterBarData) filteredData = isEmpty(filterBarData) ? [] : filterBarData

        return filteredData
    }, [data, filterBarData])

    return (
        <Flex>
            <Table2
                className='lcm-full-table'
                {...props}
                columns={columns} //{tableColumns}
                data={tableData}
                pagination={{currentPage: 0, pageSize: 15}}
                striped
                size='compact'
                placeholderProps={{
                    icon: SelectionsIcon,
                    title: 'No Data Available',
                    description: 'There are no records to display. Try adjusting your filters or check back later.'
                }}
            >
                <Table2.Header className='lcm-table-header'>
                    <FlexTableHeader className='lcm-table-header-btns' flexDirection='row' gap={aliasTokens.space200} justifyContent='flex-end'>
                        <Table2.AdjustmentBar
                            className='lcm-table-adjustmentbar'
                            hasSort={false}
                            hasLayout={false}
                            hasSearch={false}
                            hasFilters
                            hasReset
                            fieldsList={columns.map((column: JSONObject) => ({
                                id: column.accessorKey,
                                label: column.header,
                            }))}
                            filterOpened={filterValue}
                            onChange={handleAdjustmentBarChange}
                            onReset={() => setFilterBarData(undefined)}
                        />
                        <DownloadCsvButton 
                            classPfx="lcm"
                            filename={`lcm_report.csv`}
                            data={tableData}
                        />
                    </FlexTableHeader>
                </Table2.Header>
            </Table2>
        </Flex>
    )
}

export const LCMReport: FC = () => {
    const { data: lcmData, isLoading, isError, isSuccess } = useLCM()

    return (
        <FlexView className='last-call-monitored' column gap={aliasTokens.space350}>
            <AdjustCSS // adjust table header's axis distribution
                tag='div'
                attribute='data-anchor'
                searchValue='table-header'
                style={{justifyContent: "flex-end"}}
            />
            <Flex className='lcm-header' flexDirection='row' gap={aliasTokens.space400}>
                <Text className="lcm-title" fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold}>
                    Last Call Monitored Report
                </Text>
                <ActionIcon
                    className="lcm-info-tooltip"
                    disableHoverEffect
                    color={aliasTokens.color.primary600}
                    size="regular"
                    icon={InformationOutlineIcon}
                    tooltip="
                        The Last Call Monitored Report tracks all currently active RIs and their monitoring history within
                        the past year. This report helps ensure consistent and even monitoring coverage and identifies RIs
                        who may need more monitoring evaluations. ***Date difference is in hours.
                    "
                />
            </Flex>
            <InlineSpinner loading={isLoading} isFillParent>
                {isError && <EmptyQAFormState size='regular' title="Error Occured" error description="An error occured when fetching the data." />}
                {isSuccess && <LCMTable className='lcm-report' reportData={lcmData} />}
            </InlineSpinner>
        </FlexView>
    )
}