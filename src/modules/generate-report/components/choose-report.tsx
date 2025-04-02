import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import { useReportContext } from '../reports/reports'
import { ReportToggleButton, FlexButton, FlexText, StyledFilterDropdown } from '../styles'
import { aliasTokens, useGDSConfig } from '@nielsen-media/maf-fc-foundation'
import { useDataContext } from '../../../lib/context/static-data'

const ChooseReport = () => {
    const { riID, reportName, setRI, setReport } = useReportContext()
    const { riList } = useDataContext() // get RI list
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
            {reportName &&
                (<Flex className='report-params' column alignItems='center'>
                    <StyledFilterDropdown // RI Dropdown
                        className='ri-id-param' 
                        size='compact'
                        hasSelectionBar
                        label="Enter RI ID:"
                        data-selector='ri_id'
                        items={riList}
                        layout="vertical"
                        maxHeight="s200"
                        required
                        allowReselect
                        searchable
                        selectedValue={riID}
                        onChange={(value) => { setRI(value.toString()) }}
                    />
                </Flex>
            )}
        </Flex>
    )
}

export default ChooseReport