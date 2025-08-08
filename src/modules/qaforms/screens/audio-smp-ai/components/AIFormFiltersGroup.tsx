import { FC, useState } from "react"
import { aliasTokens } from "@nielsen-media/maf-fc-foundation"
import { useDataContext } from "../../../../../lib/context/data.context"
import Flex from "@nielsen-media/maf-fc-flex"
import Text from "@nielsen-media/maf-fc-text"
import { useAIFormContext } from "../../../base/formAI.context"
import { FlexAIFilters, FlexAIQuery, FlexQueryGroup, QuerySingleSelect } from '../styles'
import DatePicker, { PartialPickerDate, RangeDatePicker } from '@nielsen-media/maf-fc-date-picker'
import Button from '@nielsen-media/maf-fc-button'
import { CheckmarkIcon, ResetIcon } from '@nielsen-media/maf-fc-icons'
import { DEVIATIONCATEGORY } from '../../../../../modules/qaforms/base/constants'
import { FiltersItems } from "@nielsen-media/maf-fc-sticky-header-filters/dist/types/src/types"
import StickyFilterSingleSelect from "../../../../../lib/components/inputs/StickyFilterSingleSelect"
import StickyFilterMultiSelect from "../../../../../lib/components/inputs/StickyFilterMultiSelect"
import StickyHeaderFilters from "@nielsen-media/maf-fc-sticky-header-filters"
import { format } from "date-fns"
import Chip from "@nielsen-media/maf-fc-info-chip"

export const AIFormFiltersGroup: FC = () => {
    const { dropdowns } = useDataContext()
    const { defaultFields, setQueryParams, setDateSetting, dateSetting, recordDate, setRecordDate, recordDateRange, setRecordDateRange, riID, setRI, filterItems, setFilterItems, resetQuery } = useAIFormContext()

    const defaultFilterData = [
        { title: 'Call Type', label: null },
        { title: 'Frame Code', label: null },
        // { title: 'Total Score', label: null },
        { title: 'Deviation Category', label: null, chip: { label: '0', variant: Chip.Variant.neutral } },
        { title: 'Scoring Category', label: null, chip: { label: '0', variant: Chip.Variant.neutral } },
    ]

    const SCORINGCATEGORY = defaultFields.filter(field => field.fieldType === "scoring_dropdown")?.map((field) => ({
        label: field.name,
        value: field.label
    }))

    // Sticky Filters useStates
    const [isExpanded, setIsExpaned] = useState(false)
    const [selectedFilters, setSelectedFilters] = useState<FiltersItems[]>(filterItems)
    const [calltypeValue, setCalltypeValue] = useState<string>('')
    const [framecodeValue, setFramecodeValue] = useState<string>('')
    // const [totalScoreValue, setTotalScoreValue] = useState(isDefault ? [] : ['AL', 'AK'])
    const [deviationCatgValue, setDeviationCatgValue] = useState<string[]>([])
    const [scoringCatgValue, setScoringCatgValue] = useState<string[]>([])

    const handleReset = () => {
        setCalltypeValue('')
        setFramecodeValue('')
        // setSelectedValue(isDefault ? [] : ['AL', 'AK'])
        setDeviationCatgValue([])
        setScoringCatgValue([])
        setSelectedFilters(defaultFilterData)
    }

    return (
        <FlexQueryGroup column className='ai-query-filter' gap={aliasTokens.space800}>
            <FlexAIQuery column className='ai-query-group' gap={aliasTokens.space500}>
                <Text fontSize='s500' fontWeight='regular'>
                    Select the following parameters to load monitoring data below:
                </Text>
                
                <Flex className='ai-query-parameters' flexDirection='row' gap={aliasTokens.space300}>
                    <DatePicker.Input // Record Date Input
                        className='record-date-param'
                        data-selector='record_date'
                        size="compact"
                        label='Choose Exact Date'
                        minDate={new Date().setMonth(new Date().getMonth() - 12, 1)} // limited to 12 months
                        dateFormat="dd MMM yyyy"
                        clearable
                        disabled={!!recordDateRange}
                        value={recordDate}
                        onChange={({ value }: { value: PartialPickerDate}) => {
                            setRecordDate(value)
                            setRecordDateRange(undefined)
                            setDateSetting('single')
                        }}
                        onClear={(event) => setRecordDate(undefined)}
                    />
                    <RangeDatePicker.Input
                        className='record-date-range-param'
                        size="compact"
                        label='Choose Date Range'
                        minDate={new Date().setMonth(new Date().getMonth() - 12, 1)}
                        view={RangeDatePicker.View.double}
                        dateFormat="dd MMM yyyy"
                        data-selector='record_date_range'
                        clearable
                        value={recordDateRange}
                        disabled={!!recordDate}
                        onSubmit={({ value }: { value: [PartialPickerDate, PartialPickerDate]}) => {
                            setRecordDateRange(value)
                            setRecordDate(undefined)
                            setDateSetting('range')
                        }}
                        onClear={(event) => setRecordDateRange(undefined)}
                    />
                    <QuerySingleSelect
                        className='ri-id-param'
                        size='compact'
                        hasSelectionBar
                        label="RI ID"
                        data-selector='ri_id'
                        items={dropdowns.ri_id.filter(ri => ri.lob === "Audio")}
                        layout="vertical"
                        maxHeight="s200"
                        allowReselect
                        searchable
                        selectedValue={riID}
                        onChange={(value) => { setRI(value.toString()) }}
                    />
                    <Flex className='query-param-btns' flexDirection='row' alignItems='flex-end'>
                        <Button
                            size='compact'
                            variant='secondary'
                            roundedCorners='left'
                            view='outlined'
                            icon={{
                                icon: ResetIcon,
                                iconPosition: 'left'
                            }}
                            onClick={(event) => { resetQuery() }}
                        >
                            Reset
                        </Button>
                        <Button
                            size='compact'
                            variant='primary'
                            roundedCorners='right'
                            view='outlined'
                            disabled={(dateSetting === 'single' && !recordDate) || (dateSetting === 'range' && !recordDateRange) || !riID}
                            icon={{
                                icon: CheckmarkIcon,
                                iconPosition: 'left'
                            }}
                            onClick={(event) => {  
                                setQueryParams(dateSetting === 'single' 
                                    ? { date: format(recordDate, 'yyyy-MM-dd'), riID: riID }
                                    : { beforeDate: format(recordDateRange[1], 'yyyy-MM-dd'), afterDate: format(recordDateRange[0], 'yyyy-MM-dd'), riID: riID }
                                )
                            }}
                        >
                            Apply
                        </Button>
                    </Flex>
                </Flex>
            </FlexAIQuery>

            <FlexAIFilters column>
                <StickyHeaderFilters
                    onExpand={() => setIsExpaned(!isExpanded)}
                    onApply={() => {
                        setFilterItems([...selectedFilters])
                        setIsExpaned(false)
                    }}
                    onReset={handleReset}
                    className="ai-filter-parameters"
                    filteredItems={filterItems}
                >
                    <StickyFilterSingleSelect
                        items={dropdowns.call_type_id}
                        position={0}
                        label='Call Type'
                        filterItems={filterItems}
                        selectedValue={calltypeValue}
                        setSelectedValue={setCalltypeValue}
                        setSelectedFilters={setSelectedFilters}
                    />
                    <StickyFilterSingleSelect
                        items={dropdowns.frame_code_id}
                        position={1}
                        label='Frame Code'
                        filterItems={filterItems}
                        selectedValue={framecodeValue}
                        setSelectedValue={setFramecodeValue}
                        setSelectedFilters={setSelectedFilters}
                    />
                    {/* <TypeaHeadSearchInput
                        items={totalScore}
                        position={2}
                        label='Movies'
                        filterItems={filterItems}
                        searchValue={moviesSearchValue}
                        setSearchValue={setMoviesSearchValue}
                        setSelectedFilters={setSelectedFilters}
                    /> */}
                    <StickyFilterMultiSelect
                        label='Deviation Category'
                        position={2}
                        items={DEVIATIONCATEGORY}
                        selectedValue={deviationCatgValue}
                        setSelectedValue={setDeviationCatgValue}
                        filterItems={filterItems}
                        setSelectedFilters={setSelectedFilters}
                    />
                    <StickyFilterMultiSelect
                        label='Scoring Category'
                        position={3}
                        items={SCORINGCATEGORY}
                        selectedValue={scoringCatgValue}
                        setSelectedValue={setScoringCatgValue}
                        filterItems={filterItems}
                        setSelectedFilters={setSelectedFilters}
                    />
                </StickyHeaderFilters>
            </FlexAIFilters>
        </FlexQueryGroup>
    )
}