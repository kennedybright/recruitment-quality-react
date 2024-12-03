import React, { useState, memo, useEffect } from 'react'
import { useMAFContext } from '../../../maf-api'
import { useFormContext } from '../shared/forms'
import { aliasTokens, useGDSConfig } from '@nielsen-media/maf-fc-foundation'
import { FlexFormDetails, FlexHeaderSection, FlexSection, FlexFormHeader, 
    FlexWrapperHeaderBtnGroup, FlexWrapperHeaderText, StyledCounter, StyledDropdown, 
    StyledInputField, StyledPagination, StyledSubmitIcon } from '../styles'
import Flex from '@nielsen-media/maf-fc-flex'
import Button from '@nielsen-media/maf-fc-button'
import { UserCircleFillIcon, PhoneFillIcon, SelectionsIcon, CloseIcon, SupportFillIcon, ErrorFillIcon } from '@nielsen-media/maf-fc-icons' 
import Text from '@nielsen-media/maf-fc-text'
import List from '@nielsen-media/maf-fc-list'
import ContextSwitcher from '@nielsen-media/maf-fc-context-switcher'
import Checkbox from '@nielsen-media/maf-fc-checkbox'

// Live + Do Not Print = ERROR! -- Live means Do Not Print disabled OR Do Not Print means Live disabled


const QAFormTop: React.FC = () => {
    const {
        actions: { navigate },
        selectors: { useAppState, useAppPath, useNavigate },
        notifier: { dialog },
    } = useMAFContext()
    const [ appId, screenId ] = useAppPath()
    
    const { qaForms, getActiveForm, updateField, methods, resetQA, setActiveForm, getFields, onSubmit } = useFormContext()
    const { watch } = methods
    const activeForm = getActiveForm()
    const { activeFormID = activeForm.formID } = useAppState()
    navigate({ appState: { activeFormID } })

    const [toggleState, setToggleState] = useState("Audio") // save current Audio/SMP toggle state
    const [defaultToggleState, setDefaultToggleState] = useState("Audio") // save default Audio/SMP toggle state
    // set current toggle state to default state when a new form is created
    useEffect(() => {
        setToggleState(defaultToggleState)
    }, [defaultToggleState])

    const [callCounterData, setCallCounterData] = useState([]) // save Call Counter form counts
    // calulate the updated Call Counter form counts
    useEffect(() => {
        const countsByRI = {}
        qaForms.forms.forEach((form) => {
            const riIDField = form.fields.find(field => field.label === "ri-id")
            const liveCallField = form.fields.find(field => field.label === "live-call")
            
            if (riIDField && liveCallField) {
                const riID:string = riIDField.value
                const isLive:boolean = liveCallField.value
                if (riID !== "") {
                    if (!countsByRI[riID]) countsByRI[riID] = { riID, totalCount:0, live:0, nonlive:0 }
                    countsByRI[riID].totalCount +=1
                    if (isLive) {
                        countsByRI[riID].liveCount +=1
                    } else { 
                        countsByRI[riID].nonliveCount +=1
                    }
                }
            }
        })

        if (Object.keys(countsByRI).length > 0) {
            const tableData = Object.values(countsByRI).map(({riID, totalCount, live, nonlive}) => ({riID, totalCount, live, nonlive}))
            setCallCounterData(Object.values(tableData))
        } else {
            setCallCounterData([])
        }
    }, [qaForms.forms])

    const callCounterTableCols = [
        { header: 'RI ID', accessorKey: 'riID' },
        { header: 'Total Count', accessorKey: 'totalCount' },
        { header: 'Live', accessorKey: 'live' },
        { header: 'Non-Live', accessorKey: 'nonlive' },
    ]

    const qaCheckboxes = getFields(60, 63).map(field => {
        // Replace dashes and convert string to sentence case
        const name = field.label.replaceAll("-", " ").toLowerCase().replace(/(?:^|\s)\w/g, (match) => match.toUpperCase())
        return { ...field, name: name }
    })

    const onExit = () => {
        const confirm = () => {
            console.log("Exiting Audio/SMP QA monitoring form...")
            //navigate({ appId: appId }) // navigate to homepage
        }
    
        dialog.show('Are you sure that you want to leave?', {
          icon: SupportFillIcon,
          variant: dialog.variant.warning,
          message: 'You have started monitoring. Current changes you made may not be saved.',
          buttons: {
              confirm: {
                  onClick: () => confirm(),
                  text: 'Proceed',
              },
              cancel: {
                  onClick: () => console.log("Canceling..."),
                  text: 'Cancel'
              }
          }
        })
        resetQA()
    }

    return (
        <Flex className='form-top' column>
            <FlexHeaderSection flexDirection='row' gap={aliasTokens.space500} id='page-header'>
                <Flex column gap={0} flexBasis='68%' id='page-header-text'>
                <Text externalAs='h1' fontSize={Text.FontSize.s900} fontWeight={Text.FontWeight.bold}>
                    Audio & SMP QA Monitoring Form
                </Text>
                <Text fontSize={Text.FontSize.s300} fontWeight={Text.FontWeight.regular}>
                    Tracking the compliance of phone calls made by RIs to households being initially recruited for Audio PPM & Diary, and SMP.
                </Text>
                </Flex>
                <FlexWrapperHeaderBtnGroup id='form-header-btns' flexDirection='row' gap={aliasTokens.space300}>
                <Button className='exit'
                    type='button'
                    variant='secondary'
                    size='compact'  
                    view='outlined'
                    aria-label='form-top-exit'
                    roundedCorners='all'
                    icon={{
                        icon: CloseIcon,
                        iconPosition: 'left'
                    }}
                    //onClick={() => onExit}
                >
                    Exit
                </Button>
                <Button className='top-submit'
                    type='submit'
                    size='compact'
                    roundedCorners='all'
                    variant='primary'
                    view='solid'
                    aria-label='form-top-submit'
                    icon={{
                    icon: StyledSubmitIcon,
                    iconPosition: 'right'
                    }}
                    //onClick={() => onSubmit}
                >
                    Submit
                </Button>
                </FlexWrapperHeaderBtnGroup>
            </FlexHeaderSection>
            <FlexFormHeader className="form-header" column gap={aliasTokens.space350}>
                <FlexSection flexDirection='row' gap={aliasTokens.space700}>
                    <FlexFormDetails className='current-form-details' column gap={aliasTokens.space600}>
                        <Flex className='current-form-details-header-w-btns' flexDirection='row' gap={aliasTokens.space500}>
                            <FlexWrapperHeaderText className='current-form-details-header' gap={0}>
                                <Text className='current-form-details-title' externalAs='h3' fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold}>
                                    Current Form Details
                                </Text>
                            </FlexWrapperHeaderText>
                            <ContextSwitcher
                                className='audio-smp-toggle'
                                selectedValue={toggleState}
                                size='jumbo'
                                data-selector='audio-smp'
                                onChange={({ event, index, value, label }) => {
                                    setDefaultToggleState(value.toString())
                                    updateField('audio-smp', value=value)
                                }}
                            >
                                <ContextSwitcher.Item 
                                    className="audio-toggle"
                                    label="Audio" 
                                    value="Audio"
                                    selected={toggleState === "Audio" ? true : false}
                                />
                                <ContextSwitcher.Item 
                                    className="smp-toggle" 
                                    label="SMP" 
                                    value="SMP" 
                                    selected={toggleState === "SMP" ? true : false}
                                />
                            </ContextSwitcher>
                        </Flex>
                        <Flex className="details" column gap={aliasTokens.space700}>
                            <List className="details-current-form-metadata" size='regular' groupDirection='row' hasDivider>
                                <List.Item className='record-date' body={activeForm.metadata.recordDate} heading={"Record Date"} />
                                <List.Item className='record-time' body={activeForm.metadata.recordTime} heading={"Record Time"} />
                                <List.Item className='qr-id' body={activeForm.metadata.qrID} heading={"QR ID"} icon={UserCircleFillIcon} />
                                <List.Item className='site-name' body={activeForm.metadata.siteName} heading={"Site Name"} icon={PhoneFillIcon} />
                            </List>
                            <Flex className="details-current-form-attributes" flexDirection='row' gap={aliasTokens.space700}>
                                <StyledDropdown
                                    className='ri-id'
                                    size='compact'
                                    hasSelectionBar
                                    label="RI ID"
                                    data-selector='ri-id'
                                    items={[
                                        { label: 'G2948', value: 'G2948' },
                                        { label: 'G833', value: 'G833' },
                                        { label: 'G4835', value: 'G4835' },
                                    ]}
                                    layout="vertical"
                                    maxHeight="s200"
                                    required
                                    allowReselect
                                    searchable
                                    selectedValue={
                                        activeForm.fields.find((field)=> field.label === "ri-id").value === "" ? watch("ri-id") : activeForm.fields.find((field)=> field.label === "ri-id").value
                                    }
                                    onChange={(value) => { updateField('ri-id', value=value)}}
                                />
                                <StyledDropdown
                                    className='ri-shift'
                                    size='compact'
                                    hasSelectionBar
                                    label="RI Shift"
                                    data-selector='ri-shift'
                                    items={[ { label: 'Day', value: 'AM' }, { label: 'Night', value: 'PM' } ]}
                                    layout="vertical"
                                    maxHeight="s200"
                                    required
                                    allowReselect
                                    selectedValue={
                                        activeForm.fields.find((field)=> field.label === "ri-shift-id").value === "" ? watch("ri-shift-id") : activeForm.fields.find((field)=> field.label === "ri-shift-id").value
                                    }
                                    onChange={(value) => { updateField('ri-shift-id', value=value)}}
                                />
                                <StyledInputField
                                    className='sample-id' 
                                    label="Sample ID" 
                                    required 
                                    value={
                                        activeForm.fields.find((field)=> field.label === "sample-id").value === "" ? watch("sample-id") : activeForm.fields.find((field)=> field.label === "sample-id").value
                                    }
                                    size='compact' 
                                    data-selector='sample-id'
                                    onChange={(e) => { updateField('sample-id', e.target.value)}}
                                />
                                <StyledDropdown
                                    className='call-type'
                                    size='compact'
                                    hasSelectionBar
                                    label="Call Type"
                                    data-selector='call-type'
                                    items={[
                                        { label: 'RECNV', value: 'RECNV'},
                                        { label: 'PL', value: 'PL'},
                                        { label: 'FL', value: 'FL'},
                                        { label: 'REC', value: 'REC'},
                                    ]}
                                    layout="vertical"
                                    maxHeight="s200"
                                    required
                                    allowReselect
                                    selectedValue={
                                        activeForm.fields.find((field)=> field.label === "call-type-id").value === "" ? watch("call-type-id") : activeForm.fields.find((field)=> field.label === "call-type-id").value
                                    }
                                    onChange={(value) => { updateField('call-type-id', value=value)}}
                                />
                                <StyledDropdown
                                    className='frame-code'
                                    size='compact'
                                    hasSelectionBar
                                    label="Frame Code"
                                    data-selector='frame-code'
                                    items={[
                                        { label: 'HOUSTON', value: 'HOUSTON'},
                                        { label: 'DMFL', value: 'DMFL'},
                                        { label: 'ABSF', value: 'ABSF'},
                                        { label: 'OOH', value: 'OOH'},
                                    ]}
                                    layout="vertical"
                                    maxHeight="s200"
                                    required
                                    allowReselect
                                    selectedValue={
                                        activeForm.fields.find((field)=> field.label === "frame-code-id").value === "" ? watch("frame-code-id") : activeForm.fields.find((field)=> field.label === "frame-code-id").value
                                    }
                                    onChange={(value) => {updateField('frame-code-id', value=value)}}
                                />
                                <StyledDropdown
                                    className='call-direction'
                                    size='compact'
                                    hasSelectionBar
                                    label="Call Direction"
                                    data-selector='call-direction'
                                    items={[
                                        { label: 'Inbound', value: 'IN'},
                                        { label: 'Outbound', value: 'OUT'},
                                    ]}
                                    layout="vertical"
                                    maxHeight="s200"
                                    required
                                    allowReselect
                                    selectedValue={
                                        activeForm.fields.find((field)=> field.label === "call-direction").value === "" ? watch("call-direction") : activeForm.fields.find((field)=> field.label === "call-direction").value
                                    }
                                    onChange={(value) => {updateField('call-direction', value=value)}}
                                />
                            </Flex>
                            <Flex className="details-current-form-call-attributes" alignSelf='center' flexDirection='row' gap={aliasTokens.space850}
                            >
                                {Object.values(qaCheckboxes).map(f => (
                                    <Checkbox 
                                        size='regular' 
                                        label={f.name} 
                                        checked={activeForm.fields.find((field)=> field.label === f.label).value} 
                                        onChange={(e, {checked, indeterminate}) => {updateField(f.label, checked)}}
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
                        currentPage={activeFormID-1}
                        totalItems={qaForms.forms.length}
                        pageSize={1}
                        onChange={({ currentPage }) => {
                            navigate({ appState: { activeFormID: currentPage+1 } })
                            setActiveForm(currentPage+1)
                        }}
                    />
                </FlexSection>
            </FlexFormHeader>
        </Flex>
    )
}

export default QAFormTop