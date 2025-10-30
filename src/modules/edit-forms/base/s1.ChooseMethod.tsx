import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import RadioCard from '@nielsen-media/maf-fc-radio-card'
import { MultiSelect, SingleSelect } from '@nielsen-media/maf-fc-select'
import { useEditContext } from './edit.context'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { BulkEditIcon, EditIcon } from '@nielsen-media/maf-fc-icons'
import { FlexEditParams, StyledEditParamInput } from '../styles'
import DatePicker, { PartialPickerDate, PickerDate } from '@nielsen-media/maf-fc-date-picker'
import { useState } from 'react'
import { useDataContext } from '../../../lib/context/data.context'
import { formatPickerAsDate } from '../../../lib/utils/formatDateTime'
import { FlexWrapper350 } from '../../../lib/shared.styles'
import { EDITMODES } from './constants'

const SingleModeOptions = () => {
    const { recordNumber, setRecordNumber, filterError } = useEditContext()
    
    return (
        <FlexEditParams className='single-edit-params' column gap={aliasTokens.space350}>
            <StyledEditParamInput // Record Number Input
                className='record-number-param'
                label="Enter Record Number:" 
                required
                value={recordNumber}
                size='compact'
                data-selector='record_number'
                onChange={(e) => { setRecordNumber(e.target.value) }}
                error={filterError} // check if recordNumber is a valid Number
            />
        </FlexEditParams>
    )
}

const BulkModeOptions = () => {
    const { apps, dropdowns } = useDataContext()
    const { appID, riID, setRI, setRecordDate, recordDate } = useEditContext()

    const appLOB = apps[appID].appLOB
    const initalPickerDate: PickerDate = recordDate === "" ? undefined : new Date(recordDate)
    const [pickerDate, setPickerDate] = useState<PartialPickerDate>(initalPickerDate)

    const handleDateOnChange = (({ value }: { value: PartialPickerDate}) => {
        setPickerDate(value)
        setRecordDate(formatPickerAsDate(value))
    })

    return (
        <FlexEditParams className='bulk-edit-params' column gap={aliasTokens.space500}>
            <Text className='filter-info-text' fontSize={Text.FontSize.s500} fontWeight={Text.FontWeight.regular} textAlign='center'>
                To edit multiple records, you must enter at least one of the following filters:
            </Text>
            <DatePicker.Input // Record Date Input
                className='record-date-param'
                data-selector='record_date'
                size="compact"
                minDate={new Date().setMonth(new Date().getMonth() - 12, 1)} // limited to 12 months
                dateFormat="dd MMM yyyy"
                clearable
                value={pickerDate}
                onChange={handleDateOnChange}
            />
            <SingleSelect // RI Dropdown
                className='ri-id-param'
                size='compact'
                hasSelectionBar
                label="Enter RI ID:"
                data-selector='ri_id'
                items={dropdowns.ri_id.filter(ri => ri.lob === "Audio")} //appLOB)}
                layout="vertical"
                maxHeight="s200"
                allowReselect
                searchable
                selectedValue={riID}
                onChange={(value) => { setRI(value.toString()) }}
            />
        </FlexEditParams>
    )
}

const ChooseMethod = () => {
    const { editMode, setEditMode, auditTracking, setAuditTracking, reset } = useEditContext()
    const { dropdowns } = useDataContext()

    return (
        <Flex className='choose-method' column alignItems='center' justifyContent='center' gap={aliasTokens.space800}>
            <FlexWrapper350 className='body-header' column>
                <Text className='body-header-title' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold} textAlign='center'>
                    Choose a method to edit:
                </Text>
            </FlexWrapper350>
            <Flex className='edit-mode-options' flexDirection='row' gap="100px" justifyContent='center'>
                {Object.keys(EDITMODES).map(mode => {
                    return (
                        <RadioCard
                            className="edit-mode-option"
                            icon={{props: { icon: mode === "single" ? EditIcon : BulkEditIcon }}}
                            size="regular"
                            title={mode === "single" ? "Edit a Single Form" : "Edit Multiple Forms"}
                            view="solid"
                            checked={editMode === mode}
                            onChange={() => {
                                reset()
                                setEditMode(mode as "single" | "bulk")
                            }}
                        />
                    )
                })}
            </Flex>
            <Flex className='edit-params' column alignItems='center' gap={aliasTokens.space800}>
                {editMode && ( // Audit Reason Select
                    <MultiSelect 
                        className='audit-tracking' 
                        size='compact'
                        hasSelectionBar
                        label="Select Audit Reason(s):"
                        data-selector='audit_tracking'
                        items={dropdowns.audit_tracking}
                        layout="vertical"
                        maxHeight="s200"
                        required
                        searchable
                        searchPlaceholder="Search RI"
                        selectedValues={auditTracking}
                        infoIconText='Select one or multiple audit reasons. You must choose at least one reasoning code before submitting your changes.'
                        onChange={(value) => { setAuditTracking(value as number[]) }}
                    />
                )}

                {editMode === "single" && <SingleModeOptions />}
                {editMode === "bulk" && <BulkModeOptions />}
            </Flex>
        </Flex>
    )
}

export default ChooseMethod