import { FC, useState, useEffect } from 'react'
import { useMAFContext } from '../../../../maf-api'
import { useFormContext } from '../../forms'
import { aliasTokens, GDSTheme } from '@nielsen-media/maf-fc-foundation'
import { FlexFormDetails, FlexSection, FlexFormHeader, FlexWrapperHeaderText, StyledCounter, StyledDropdown, 
    StyledInputField, StyledPagination, StyledToggle } from '../styles'
import Flex from '@nielsen-media/maf-fc-flex'
import { UserCircleFillIcon, PhoneFillIcon, SelectionsIcon } from '@nielsen-media/maf-fc-icons'
import Text from '@nielsen-media/maf-fc-text'
import List from '@nielsen-media/maf-fc-list'
import Checkbox from '@nielsen-media/maf-fc-checkbox'
import { useDataContext } from '../../../../lib/context/static-data'
import AdjustCSS from '../../../../lib/utils/adjust-css'

const QAFormTop: FC = () => {
    const { notifier: { banner } } = useMAFContext()
    const { riList, calltypeList, framecodeList, sitenameList, callDirectionList, riShiftList } = useDataContext()
    const { methods, qaForms, activeForm, activeFields, setActiveForm, updateField, setDefaultField, getFields } = useFormContext()
    const { watch } = methods

    const [currentPage, setCurrentPage] = useState<number>(0)
    useEffect(() => { // set Current Page when the active form changes
        const pageNdx = qaForms.forms.findIndex(form => form.formID === qaForms.activeFormID)
        if (pageNdx !== -1 && pageNdx != currentPage) setCurrentPage(pageNdx)
    }, [qaForms.activeFormID, qaForms.forms, currentPage])

    const [formType, setFormType] = useState("Audio") // save current form type (Audio or SMP)
    const [defaultFormType, setDefaultFormType] = useState(formType) // save current default form type
    useEffect(() => { // set current form type to default fields when a new form is created
        const audioSmp = activeFields.find((field) => field.label === 'audio_smp').value
        audioSmp ? setFormType(audioSmp) : updateField("audio_smp", defaultFormType)
        setDefaultFormType(formType)
    }, [qaForms.activeFormID, activeFields])

    const callCounterTableCols = [
        { header: 'RI ID', accessorKey: 'riID' },
        { header: 'Total Count', accessorKey: 'totalCount' },
        { header: 'Live', accessorKey: 'live' },
        { header: 'Non-Live', accessorKey: 'nonlive' },
    ]
    const [callCounterData, setCallCounterData] = useState([]) // save Call Counter form counts
    useEffect(() => { // calulate the updated Call Counter form counts
        const countsByRI: Record<string, {riID:string, totalCount:number, live:number, nonlive:number}> = {}
    
        qaForms.forms.forEach((form) => {
            const riIDField = form.fields.find(field => field.label === "ri_id")
            const liveCallField = form.fields.find(field => field.label === "live_call")
            if (riIDField) { //&& liveCallField) {
                const riID: string = riIDField.value
                const isLive: boolean = liveCallField.value
    
                if (riID) { // Initialize counts for this riID if not already present
                    if (!countsByRI[riID]) {
                        countsByRI[riID] = { riID, totalCount: 0, live: 0, nonlive: 0 }
                    }
                    countsByRI[riID].totalCount +=1
                    isLive ? countsByRI[riID].live +=1 : countsByRI[riID].nonlive +=1    
                }
            }
        })
        
        const tableData = Object.values(countsByRI).map(({riID, totalCount, live, nonlive}) => ({
            riID, 
            totalCount: String(totalCount), 
            live: String(live), 
            nonlive: String(nonlive)
        }))
        tableData.length > 0 ? setCallCounterData(Object.values(tableData)) : setCallCounterData([])
    }, [qaForms.forms])

    const [maxReachedNotified, setMaxReachedNotified] = useState([])
    useEffect(() => { // trigger banner notification if a user reaches max monitoring count for any RI
        const MAXRICOUNT = 100 // RI call threshold count
        const riCount = callCounterData.map(({riID, totalCount}) => ({riID, totalCount}))
        const maxReached = riCount.filter(({totalCount}) => totalCount >= MAXRICOUNT).map(({riID}) => riID )

        if (maxReached.length > 0) {
            const resetNotified = maxReachedNotified.filter((riID) => !maxReached.includes(riID))
            const newToBeNotified = maxReached.filter(riID => !maxReachedNotified.includes(riID)).filter(riID => !resetNotified.includes(riID))

            if (newToBeNotified.length > 0) {
                newToBeNotified.forEach(riID => {
                    banner.show(`You have reached the daily monitoring limit for RI: ${riID}.`, {
                        variant: banner.variant.warning,
                    })
                })
                setMaxReachedNotified((prev) => { return [...prev, ...newToBeNotified] })
            }

            if (resetNotified.length > 0) {
                setMaxReachedNotified((prev) => prev.filter((riID) => !resetNotified.includes(riID)))
            }
        } else {
            if (maxReachedNotified.length > 0) setMaxReachedNotified([]) // reset notified list
        }
    }, [callCounterData])

    // set Disabled on Live/DoNotPrint checkbox -> Live means Do Not Print disabled OR Do Not Print means Live disabled
    const qaCheckboxes = getFields(13, 16)
    const [disabled, setDisabled] = useState("")
    useEffect(() => { // update disabled when the active form changes
        const liveCall = activeFields.find((field) => field.label === "live_call").value
        const doNotPrint = activeFields.find((field) => field.label === "do_not_print").value
        const disabled = !liveCall ? !doNotPrint ? "" : "live_call" : "do_not_print"
        setDisabled(disabled)
    }, [qaForms.activeFormID, activeFields])

    console.log("form-top // activeFields: ", activeFields)

    return (
        <Flex className='form-top' column>
            <AdjustCSS // adjust Audio/SMP toggle width
                isBody={true}
                tag='div'
                attribute='data-selector'
                searchValue='audio_smp'
                style={{overflowX: "unset"}}
            />
            <FlexFormHeader className="form-header" column gap={aliasTokens.space350}>
                <FlexSection flexDirection='row' gap={aliasTokens.space700}>
                    <FlexFormDetails className='current-form-details' column gap={aliasTokens.space600}>
                        <Flex className='current-form-details-header-w-btns' flexDirection='row' gap={aliasTokens.space500}>
                            <FlexWrapperHeaderText className='current-form-details-header' gap={0}>
                                <Text className='current-form-details-title' externalAs='h3' fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold}>
                                    Current Form Details
                                </Text>
                            </FlexWrapperHeaderText>
                            <StyledToggle
                                className='form-type-toggle'
                                selectedValue={formType}
                                size='jumbo'
                                data-selector='audio_smp'
                                onChange={({ event, index, value, label }) => {
                                    setDefaultFormType(value.toString())
                                }}
                                theme={GDSTheme.dark}
                            >
                                <StyledToggle.Item
                                    className="audio-toggle"
                                    label="Audio" 
                                    value="Audio"
                                    selected={formType === "Audio"}
                                    onChange={({ event, index, value, label }) => {
                                        updateField('audio_smp', value=value.toString())
                                        setFormType(value.toString())
                                    }}
                                />
                                <StyledToggle.Item 
                                    className="smp-toggle" 
                                    label="SMP" 
                                    value="SMP" 
                                    selected={formType === "SMP"}
                                    onChange={({ event, index, value, label }) => {
                                        updateField('audio_smp', value=value.toString())
                                        setFormType(value.toString())
                                    }}
                                />
                            </StyledToggle>
                        </Flex>
                        <Flex className="details" column gap={aliasTokens.space700}>
                            <List className="details-current-form-metadata" size='regular' groupDirection='row' hasDivider>
                                <List.Item className='record-date' data-selector='record_date' body={activeForm.metadata.recordDate} heading={"Record Date"} />
                                <List.Item className='record-time' data-selector='record_time' body={activeForm.metadata.recordTime} heading={"Record Time"} />
                                <List.Item className='qr-id' data-selector='qr_id' body={activeForm.metadata.qrID} heading={"QR ID"} icon={UserCircleFillIcon} />
                                <List.Item className='site-name' body={activeForm.metadata.siteName} heading={"Site Name"} icon={PhoneFillIcon} />
                            </List>
                            <Flex className="details-current-form-attributes" flexDirection='row' gap={aliasTokens.space700} flexWrap='wrap'>
                                <StyledDropdown
                                    className='ri-id'
                                    size='compact'
                                    hasSelectionBar
                                    label="RI ID"
                                    data-selector='ri_id'
                                    items={riList.map(({label, value}) => ({ label, value }))}
                                    layout="vertical"
                                    maxHeight="s300"
                                    required
                                    allowReselect
                                    searchable
                                    selectedValue={activeFields.find((field)=> field.label === "ri_id").value === "" ? watch("ri_id") : activeFields.find((field)=> field.label === "ri_id").value}
                                    onChange={(value) => {
                                        console.log("RI ID: ", value)
                                        updateField('ri_id', value.toString())
                                        setDefaultField('ri_id', value.toString())
                                    }}
                                />
                                <StyledDropdown
                                    className='ri-shift'
                                    size='compact'
                                    hasSelectionBar
                                    label="RI Shift"
                                    data-selector='ri_shift'
                                    items={riShiftList}
                                    layout="vertical"
                                    maxHeight="s200"
                                    required
                                    allowReselect
                                    selectedValue={activeFields.find((field)=> field.label === "ri_shift").value === "" ? watch("ri_shift") : activeFields.find((field)=> field.label === "ri_shift").value}
                                    onChange={(value) => { 
                                        updateField('ri_shift', value.toString())
                                        setDefaultField('ri_shift', value.toString())
                                    }}
                                />
                                <StyledDropdown
                                    className='site-name'
                                    size='compact'
                                    hasSelectionBar
                                    label="RI Site Name"
                                    data-selector='site_name_id'
                                    items={sitenameList}
                                    layout="vertical"
                                    maxHeight="s200"
                                    required
                                    allowReselect
                                    selectedValue={activeFields.find((field)=> field.label === 'site_name_id').value === "" ? watch('site_name_id') : activeFields.find((field)=> field.label === 'site_name_id').value}
                                    onChange={(value) => { 
                                        updateField('site_name_id', value.toString())
                                        setDefaultField('site_name_id', value.toString())
                                    }}
                                />
                                <StyledInputField
                                    className='sample-id'
                                    label="Sample ID"
                                    value={!activeFields.find((field)=> field.label === "sample_id").value ? watch("sample_id") : activeFields.find((field)=> field.label === "sample_id").value}
                                    size='compact'
                                    required 
                                    data-selector='sample_id'
                                    onChange={(e) => { updateField('sample_id', e.target.value) }}
                                    error={activeFields.find((field)=> field.label === "sample_id").value?.length > 0 && !(activeFields.find((field)=> field.label === "sample_id").value?.match(/^[0-9]+$/))}
                                />
                                <StyledDropdown
                                    className='call-type'
                                    size='compact'
                                    hasSelectionBar
                                    label="Call Type"
                                    data-selector='call_type_id'
                                    items={calltypeList}
                                    layout="vertical"
                                    maxHeight="s200"
                                    required
                                    allowReselect
                                    selectedValue={activeFields.find((field)=> field.label === "call_type_id").value === "" ? watch("call_type_id") : activeFields.find((field)=> field.label === "call_type_id").value}
                                    onChange={(value) => { 
                                        updateField('call_type_id', value.toString()) 
                                        setDefaultField('call_type_id', value.toString())
                                    }}
                                />
                                <StyledDropdown
                                    className='frame-code'
                                    size='compact'
                                    hasSelectionBar
                                    label="Frame Code"
                                    data-selector='frame_code_id'
                                    items={framecodeList}
                                    layout="vertical"
                                    maxHeight="s200"
                                    required
                                    allowReselect
                                    selectedValue={activeFields.find((field)=> field.label === "frame_code_id").value === "" ? watch("frame_code_id") : activeFields.find((field)=> field.label === "frame_code_id").value}
                                    onChange={(value) => { 
                                        updateField('frame_code_id', value.toString()) 
                                        setDefaultField('frame_code_id', value.toString())
                                    }}
                                />
                                <StyledDropdown
                                    className='call-direction'
                                    size='compact'
                                    hasSelectionBar
                                    label="Call Direction"
                                    data-selector='call_direction'
                                    items={callDirectionList}
                                    layout="vertical"
                                    maxHeight="s200"
                                    required
                                    allowReselect
                                    selectedValue={activeFields.find((field)=> field.label === "call_direction").value === "" ? watch("call_direction") : activeFields.find((field)=> field.label === "call_direction").value}
                                    onChange={(value) => { 
                                        updateField('call_direction', value.toString()) 
                                        setDefaultField('call_direction', value.toString())
                                    }}
                                />
                            </Flex>
                            <Flex className="details-current-form-call-attributes" alignSelf='center' flexDirection='row' gap={aliasTokens.space850}
                            >
                                {Object.values(qaCheckboxes).map(f => (
                                    <Checkbox 
                                        className={f.label.replaceAll("_", "-")}
                                        data-selector={f.label}
                                        size='regular'
                                        label={f.name}
                                        disabled={disabled === f.label}
                                        checked={disabled !== f.label && activeFields.find((field) => field.label === f.label).value}
                                        onChange={(e, {checked, indeterminate}) => {
                                            if (f.label === "live_call" && checked) setDisabled("do_not_print")
                                            if (f.label === "do_not_print" && checked) setDisabled("live_call")
                                            updateField(f.label, checked)
                                        }}
                                    />
                                ))}
                            </Flex>
                        </Flex>
                    </FlexFormDetails>
                    <StyledCounter
                        className="ri-call-counter"
                        tableProps={{ 
                            data: callCounterData, 
                            columns: callCounterTableCols, 
                            hideBorder: true, 
                            striped: true, 
                            size: "compact",
                        }}
                        title='RI Call Counter'
                        headerCount={qaForms.forms?.length}
                        emptyStateProps={{
                            icon: { props: {icon: SelectionsIcon} },
                            title: 'No Forms Saved. \nPlease save your forms to display progress.'
                        }}
                    >
                    </StyledCounter>
                </FlexSection>
                <FlexSection className="form-pages">
                    <StyledPagination
                        aria-label="forms-navigation"
                        currentPage={currentPage}
                        totalItems={qaForms.forms.length}
                        pageSize={1}
                        onChange={({ event, currentPage }) => {
                            setCurrentPage(currentPage)
                            const newFormID = qaForms.forms[currentPage]?.formID
                            if (newFormID) setActiveForm(newFormID)
                        }}
                    />
                </FlexSection>
            </FlexFormHeader>
        </Flex>
    )
}

export default QAFormTop