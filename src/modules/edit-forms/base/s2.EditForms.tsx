import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import { useEditContext } from './edit.context'
import { FlexMessageStatus } from '../../generate-report/styles'
import DisplayIcon, { DisplayIconSize } from '@nielsen-media/maf-fc-display-icon'
import { ErrorOutlineIcon } from '@nielsen-media/maf-fc-icons'
import { aliasTokens, textToTitleCase } from '@nielsen-media/maf-fc-foundation'
import { useEffect, useState } from 'react'
import { Loading } from '../../../lib/components/feedback/LoaderSpinner'
import AudioSMPQAForm from '../../qaforms/screens/audio-smp/components/FormAudioSMP'
import { FETCHSTATUS } from '../../../lib/utils/helpers'
import { useFormData } from '../../../lib/maf-api/hooks/report.hooks'
import QAFormBulkEditableAudio from '../components/FormAudioBulk'

const EditForms = () => {
    const [status, setStatus] = useState<FETCHSTATUS>('loading') // status of data fetching & loading for edits
    const { appID, editMode, recordNumber, recordDate, riID, setFormData, setRenderError, originalFormData } = useEditContext()
    
    const queryParams = editMode === 'single'
        ? {recordNumber: Number(recordNumber)}
        : {riID: riID, date: recordDate}
    
    const { data: formData, isLoading, isError, error } = useFormData(appID, queryParams)

    // Attempt to load the form(s) data based on the edit mode and parameters set
    useEffect(() => {
        if (originalFormData) { // If data has already been fetched, do not re-fetch!
            setStatus("success")
            return
        }

        if (formData) {
            if (formData.length === 0) {
                setStatus('no-data')
                setRenderError(true)
                return
            }

            if (editMode === 'single') setFormData(formData[0]) 
            else setFormData(formData)
            setStatus('success')
        }
    }, [formData, originalFormData])

    if (isLoading || status === 'loading') { // Loading state
        return (
            <Flex justifyContent='center' alignContent='center'>
                <Loading id="edit-forms-loading" />
            </Flex>
        )
    }

    if (isError) { // Data Load Error
        console.error(`Error loading form data in ${editMode} mode.`, error)
        setRenderError(true)

        return (
            <FlexMessageStatus column className="data-load-status-message">
                <DisplayIcon
                    icon={ErrorOutlineIcon}
                    size={DisplayIconSize.s700}
                    variant='danger'
                />
                <Text className="error-status-message" fontSize={Text.FontSize.s700} color={aliasTokens.color.danger500} fontWeight={Text.FontWeight.bold} textAlign='center'>
                    {`Error loading form data in ${editMode} mode.`}
                </Text>
                <Text className="error-message" fontSize={Text.FontSize.s400} fontWeight={Text.FontWeight.bold} textAlign='center'>
                    {textToTitleCase(error.message)}
                </Text>
            </FlexMessageStatus>
        )
    }

    if (status === 'no-data') { // No Data Available 
        return (
            // <Flex className='edit-forms' column alignItems='center' justifyContent='center'>
            <FlexMessageStatus column className="data-load-status-message">
                <DisplayIcon
                    icon={ErrorOutlineIcon}
                    size={DisplayIconSize.s700}
                    variant='danger'
                />
                <Text className="no-data-available" fontSize={Text.FontSize.s700} color={aliasTokens.color.danger500} fontWeight={Text.FontWeight.bold} textAlign='center'>
                    {editMode === "single" 
                        ? "Record not found. Please re-enter the record number."
                        : "No records found. Please adjust the filters and re-enter."
                    }
                </Text>
            </FlexMessageStatus>
            // </Flex>
        )
    }

    if (status === 'success') { // Only load data when it is available
        return (
            <Flex className='edit-forms' column>
                {editMode === "single" && <AudioSMPQAForm mode='edit' formID={originalFormData.record_number} />}
                {editMode === "bulk" && <QAFormBulkEditableAudio />}
            </Flex>
        )
    }
}

export default EditForms