import { useEffect, useState } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import { useEditContext } from '../edits/edits'
import { FlexWrapper } from '../../qaforms/qaforms-audio-smp/styles'
import { FlexMessageStatus } from '../../generate-report/styles'
import DisplayIcon, { DisplayIconSize } from '@nielsen-media/maf-fc-display-icon'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { CheckmarkIcon, ErrorOutlineIcon } from '@nielsen-media/maf-fc-icons'
import { Loading } from '../../../lib/global/components'
import { useMAFContext } from '../../../maf-api'
import { emailErrorReport } from '../../../lib/maf-api/api-form-data'
import { useMakeEditSubmission } from '../edits/edits'

const SaveForms = () => {
    const { selectors: { useUserData } } = useMAFContext()
    const { firstName, lastName } = useUserData()
    const { qr, editMode, form, forms, formChanges, auditTracking, saveFormsAndTransactions, isSuccessful, setIsSuccessful } = useEditContext()
    
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => { // Save and submit form edits to database
        const { finalForms, finalChanges } = editMode === "single" 
            ? useMakeEditSubmission(qr, 1001, editMode, form, formChanges, auditTracking)
            : useMakeEditSubmission(qr, 1001, editMode, forms, formChanges, auditTracking)
        
        const handleSave = async () => {
            try {
                const { formResponse, transactionResponse } = await saveFormsAndTransactions(finalForms, finalChanges)
                if (formResponse) {
                    // Handle form save API request
                    if (formResponse["status"] > 300) {
                        setIsSuccessful(false)
                        const errorMessage = `System error occured while submitting the edited forms. See API errors: ${formResponse["status"]} ${formResponse["statusText"]} // ${formResponse["data"]?.error}`
                        console.log("Form responses with errors: ", errorMessage)
                        onError(errorMessage)
                    } else setIsSuccessful(true)

                    if (transactionResponse) {
                        // Handle transaction save API request
                        if (transactionResponse["status"] > 300) {
                            setIsSuccessful(false)
                            const errorMessage = `System error occured while submitting the form edits. See API errors: ${transactionResponse["status"]} ${transactionResponse["statusText"]} // ${transactionResponse["data"]?.error}`
                            onError(errorMessage)
                        } else setIsSuccessful(true)
                    } else {
                        setIsSuccessful(false)
                        const errorMessage = `System error occured while submitting the edit transactions. Please investigate.`
                        onError(errorMessage)
                    }
                }
            } catch(error) {
                setIsSuccessful(false)
                console.error("Error saving forms: ", error)
                onError(`Error submitting edited forms: ${error.message}`)
            }
        }
        handleSave().then(() => setLoading(false))
    }, [])

    const onError = (message) => {
        const userFullName = `${firstName} ${lastName}`
        console.log(`${message} Sending error report...`)
        emailErrorReport(userFullName, 'Edited Forms submission attempt', message)
    }

    if (loading) return <Loading className="save-forms" /> // Loading state
    
    return (
        <FlexWrapper className='save-forms' column gap={aliasTokens.space500}>
            {isSuccessful && (
                <FlexMessageStatus flexDirection='column'>
                    <DisplayIcon
                        icon={CheckmarkIcon}
                        size={DisplayIconSize.s700}
                        variant='success'
                    />
                    <Text className="submission-status-message" fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold} textAlign='center'>
                        {editMode === "single" 
                            ? "Form has been successfully saved."
                            : "Forms have been successfully saved."
                        }
                    </Text>
                </FlexMessageStatus>
            )}
            {!isSuccessful && (
                <FlexMessageStatus flexDirection='column'>
                    <DisplayIcon
                        icon={ErrorOutlineIcon}
                        size={DisplayIconSize.s700}
                        variant='danger'
                    />
                    <Text className="submission-status-message" fontSize={Text.FontSize.s700} fontWeight={Text.FontWeight.bold} textAlign='center'>
                    {editMode === "single" 
                            ? "Form and its form changes were not successfully saved. Please go back and try again."
                            : "Forms and its form changes were not successfully saved. Please go back and try again."
                    }
                    </Text>
                </FlexMessageStatus>
            )}
        </FlexWrapper>
    )
}

export default SaveForms