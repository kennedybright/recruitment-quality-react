import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import { useEditContext } from '../edits/edits'
import QAFormSingleEditableAudio from '../edits/editable-single-form-audio'
import { Loading } from '../../../lib/global/components'
import { FlexMessageStatus } from '../../generate-report/styles'
import DisplayIcon, { DisplayIconSize } from '@nielsen-media/maf-fc-display-icon'
import { ErrorOutlineIcon } from '@nielsen-media/maf-fc-icons'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { useEffect, useState } from 'react'
import { fetchACMData, fetchACMDataTEMP } from '../../../lib/maf-api/api-report-data'
import QAFormBulkEditableAudio from '../edits/editable-bulk-form-audio'

const EditForms = () => {
    const [status, setStatus] = useState('loading') // status of data fetching & loading for edits
    const [error, setError] = useState(null)
    const { editMode, recordNumber, recordDate, riID, setForm, setForms, setOriginalFormData, setRenderState, originalFormData } = useEditContext()
    
    // Attempt to load the form(s) data based on the edit mode and parameters set
    useEffect(() => {
        if (originalFormData) { // If data has already been fetched, do not re-fetch!
            setStatus("success")
            return
        }

        const loadFormData = async() => {
            try {
                if (editMode === "single") {
                    const formData = await fetchACMDataTEMP(undefined,undefined,Number(recordNumber)) //fetchACMData(undefined,undefined,Number(recordNumber))

                    if (formData && formData.length > 0) {
                        setOriginalFormData(formData[0])
                        setForm(formData[0])
                        setStatus("success")
                    } else if (formData && formData.length === 0) {
                        setStatus("no-data")
                    } else {
                        throw new Error('Failed to load form data. Unknown error. Please troubleshoot.')
                    }
                } else if (editMode === "bulk") {
                    const formData = await fetchACMDataTEMP(riID, recordDate, undefined) //fetchACMData(riID, recordDate, undefined)
                    
                    if (formData && formData.length > 0) {
                        setOriginalFormData(formData)
                        setForms(formData)
                        setStatus("success")
                    } else if (formData && formData.length === 0) {
                        setStatus("no-data")
                    } else {
                        throw new Error('Failed to load form data. Unknown error. Please troubleshoot.')
                    }
                }
            } catch (error) {
                setStatus("error")
                setError(error.message)
                setRenderState(false)
                console.error(`Error loading form data in ${editMode} mode.`, error)
            }
        }
        loadFormData()
    }, [])

    if (status === 'loading') { // Loading state
        return ( 
            <Flex justifyContent='center' alignContent='center'>
                <Loading className="edit-forms-loading" />
            </Flex>
        )
    }

    if (status === 'no-data') { // No Data Available 
        return (
            <Flex className='edit-forms' column alignItems='center' justifyContent='center'>
                <FlexMessageStatus className="data-load-status-message" flexDirection='column'>
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
            </Flex>
        )
    }

    if (status === "error") { // Data Load Error
        return (
            <FlexMessageStatus className="data-load-status-message" flexDirection='column'>
                <DisplayIcon
                    icon={ErrorOutlineIcon}
                    size={DisplayIconSize.s700}
                    variant='danger'
                />
                <Text className="error-status-message" fontSize={Text.FontSize.s700} color={aliasTokens.color.danger500} fontWeight={Text.FontWeight.bold} textAlign='center'>
                    {`Error loading form data in ${editMode} mode.`}
                </Text>
                <Text className="error-message" fontSize={Text.FontSize.s400} fontWeight={Text.FontWeight.bold} textAlign='center'>
                    {error}
                </Text>
            </FlexMessageStatus>
        )
    }

    return (
        <Flex className='edit-forms' column>
            {/* Only load data when it is available */}
            {editMode === "single" && originalFormData && <QAFormSingleEditableAudio />}
            {editMode === "bulk" && originalFormData && <QAFormBulkEditableAudio />}
        </Flex>
    )
}

export default EditForms