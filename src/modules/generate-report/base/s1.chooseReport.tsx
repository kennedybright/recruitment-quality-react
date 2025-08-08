import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import { useReportContext } from '../components/reports'
import { ReportToggleButton, FlexButton, FlexText, StyledFilterDropdown } from '../styles'
import { aliasTokens, useGDSConfig } from '@nielsen-media/maf-fc-foundation'
import { useDataContext } from '../../../lib/context/data.context'
import DatePicker, { PartialPickerDate } from '@nielsen-media/maf-fc-date-picker'
import { formatPickerAsDate } from '../../../lib/utils/formatDateTime'

const ChooseReport = () => {
    const { riID, reportName, setRI, setReport, reportDate, setReportDate } = useReportContext()
    const { dropdowns } = useDataContext() // get RI list
    const reports = ['Call Monitoring Report', 'MCA Report'] // ALL Reports available to generate

    return (
        <Flex className='choose-report' column alignItems='center' justifyContent='center'>
            <Flex className='report-options' flexDirection='row' gap="100px" justifyContent='center'>
                {reports.map(report => { // reports available to render
                    const htmlClass = report.replaceAll(" ", "-").toLowerCase()
                    return (
                        <FlexButton column >
                            <ReportToggleButton
                                className={htmlClass}
                                checked={reportName === report}
                                label={report}
                                onChange={() => setReport(report)}
                            />
                            <FlexText>
                                <Text className={`${htmlClass}-description`} fontSize={Text.FontSize.s300} fontWeight='regular' textAlign='left' color={useGDSConfig().isDarkTheme ? aliasTokens.color.neutral400 : aliasTokens.color.neutral600}>
                                    Daily Call Observation report to be emailed to Manager
                                </Text>
                            </FlexText>
                        </FlexButton>
                    )
                })}
            </Flex>
            {reportName && (
                <Flex className='report-params' column alignItems='center' gap={aliasTokens.space700}>
                    <StyledFilterDropdown // RI Dropdown
                        className='ri-id-param' 
                        size='compact'
                        hasSelectionBar
                        label="Enter RI ID:"
                        data-selector='ri_id'
                        items={dropdowns.ri_id}
                        layout="vertical"
                        maxHeight="s200"
                        required
                        allowReselect
                        searchable
                        selectedValue={riID}
                        onChange={(value) => { setRI(value.toString()) }}
                    />
                    <DatePicker.Input // Record Date Input
                        className='record-date-param'
                        data-selector='record_date'
                        size="compact"
                        label='Enter Record Date'
                        required
                        dateFormat="dd MMM yyyy"
                        clearable
                        value={reportDate}
                        onChange={({ value }: { value: PartialPickerDate}) => { setReportDate(value) }}
                        onClear={(event) => setReportDate(undefined)}
                    />
                </Flex>
            )}
        </Flex>
    )
}

export default ChooseReport