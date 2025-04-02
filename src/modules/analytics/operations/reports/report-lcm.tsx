// Formatting for the Last Call Monitored Report

import { FC, useEffect, useState } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import Table2, { ColumnDef, NumberCellProps, Table2Props, TableData, TextCellProps } from '@nielsen-media/maf-fc-table2'
import { useMakeTable, ReportLCM } from '../../../../lib/utils/qa-reports'
import { FlexTableHeader, FlexView } from '../styles'
import { aliasTokens, JSONObject } from '@nielsen-media/maf-fc-foundation'
import { AdjustmentBarContextStates, FilterItem, FilterOperator } from '@nielsen-media/maf-fc-adjustment-bar'
import { InformationOutlineIcon, SelectionsIcon } from '@nielsen-media/maf-fc-icons'
import AdjustCSS from '../../../../lib/utils/adjust-css'
import ActionIcon from '@nielsen-media/maf-fc-action-icon'
import { InlineSpinner } from '@nielsen-media/maf-fc-spinner'
import { fetchLCMData } from '../../../../lib/maf-api/api-report-data'
import { DownloadCsvButton } from '../../../../lib/global/components'

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
    : undefined

  // ------------------------------------------------------------------------------- //

  // Generate the table data and columns
  const { data, columns } = useMakeTable({ initData: reportData, extensions: extensions, columnProps: columnPropsList })
  const [tableData, setTableData] = useState<TableData[]>(data) // rendered table data with final filtered results
  const [tableColumns, setTableColumns] = useState<ColumnDef<TableData>[]>(columns) // rendered table columns
  
  // ------------------------------------------------------------------------------- //
  
  // useStates for the Adjustment Bar
  const [filterValue, setFilterValue] = useState({opened: false, filterColumnId: ''}) // filter bar state
  const [filterBarData, setFilterBarData] = useState<TableData[]>([]) // filtered data from the Adjustment Bar
  
  const matchesFilters = (item: ReportLCM, filters: FilterItem[], operator: FilterOperator): boolean => {
    const filterCheck = ({ fieldId, value }: FilterItem) => {
      const fieldValue = `${item[fieldId as keyof ReportLCM] ?? ''}`.toLowerCase()
      return fieldValue.includes(value.toLowerCase())
    }

    if (!filters) return true
    return operator === FilterOperator.OR
      ? filters.some(filterCheck)
      : filters.every(filterCheck)
  }

  const handleAdjustmentBarChange: (state?: AdjustmentBarContextStates) => void = state => {
    const { filters, operator } = state?.filtersState || {}
    const enabledFilters = filters.filter(f => f["value"] !== "") // filter out empty search filters
  
    setFilterBarData(
      data.filter(item => { return (matchesFilters(item, enabledFilters as FilterItem[], operator as FilterOperator)) })
    )
  }

  // Calculate the final results from the Adjustment Bar
  useEffect(() => {
    if (!filterBarData.length) {
      setTableData([])
    } else {
      setTableData(filterBarData)
    }
  }, [filterBarData])

  return (
    <Flex>
      <Table2
        className='lcm-full-table'
        {...props}
        columns={tableColumns}
        data={tableData}
        pagination={{currentPage: 0, pageSize: 10}}
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
            />
            <DownloadCsvButton 
              classPfx="acm"
              filename={`LCM Report.csv`}
              data={tableData}
            />
          </FlexTableHeader>
        </Table2.Header>
      </Table2>
    </Flex>
  )
}

export const LCMReport: FC = () => {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [lcmData, setLCMData] = useState<ReportLCM[]>([])
  useEffect(() => { // Fetch user's QR ID using API
    const fetchLCM = async() => {
      try {
        const data = await fetchLCMData()
        setLCMData(data)
      } catch(err) {
        console.error("Error fetching data for the LCM Report: ", err)
      }
    }
    fetchLCM()
  }, [])

  // check if report data has been loaded
  useEffect(() => { if (lcmData.length > 0) setDataLoaded(true) }, [lcmData])

  return (
    <FlexView className='last-call-monitored' column gap={aliasTokens.space350}>
      <AdjustCSS // adjust table header's axis distribution
        isBody={true}
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
            who may need more monitoring evaluations.
          "
        />
      </Flex>
      <InlineSpinner loading={!dataLoaded} isFillParent>
        <LCMTable className='lcm-report' reportData={lcmData} />
      </InlineSpinner>
    </FlexView>
  )
}