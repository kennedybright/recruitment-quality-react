import { FC, useEffect, useMemo } from 'react'
import { FlexContentBody } from '../../../lib/shared.styles'
import { DataProvider } from '../../../lib/context/data.context'
import { useMAFContext } from '../../../maf-api'
import { Loading } from '../../../lib/components/feedback/LoaderSpinner'
import { ErrorPage } from '../../../lib/components/feedback/Error'
import { useCurrentUser } from '../../../lib/maf-api/hooks/user.hooks'
import { emailErrorReport } from '../../../lib/maf-api/services/email.service'
import { QAFormProvider } from './form.context'
import { useFormFields } from '../../../lib/maf-api/hooks/qa.hooks'
import { QAFormAIProvider } from './formAI.context'

interface BaseQAScreenBodyProps {
    classSfx: string
    appID: number
    aiEnabled?: boolean
}

const QAScreenBody: FC<BaseQAScreenBodyProps> = ({ classSfx, appID, children, aiEnabled }) => {
    const { 
        selectors: { useUserData }, 
        notifier: { banner } 
    } = useMAFContext()
    const { firstName, lastName, email } = useUserData()
    const userFullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName])

    const { data: systemUser, isLoading: userLoading, error: userError } = useCurrentUser(email)
    const { data: formFields, isLoading: fieldsLoading, error: fieldsError, isFetching: fieldsFetching } = useFormFields(appID)
    const loading = userLoading || fieldsLoading || fieldsFetching
    const error = userError || fieldsError

    useEffect(() => {
        if (error) {
            banner.show(
                `No QRID found for user: ${userFullName}. The Contact Center Quality Team Manager has been notified.`,
                { variant: banner.variant.warning }
            )
            const errorMessage = `Our system was unable to locate <strong>${userFullName}</strong> in the Contact Center's QR database. Please verify the information
            and take any necessary action to ensure they are properly added to the system. Let us know if you need further assistance. See API error: ${error.message}`
            emailErrorReport(userFullName, 'QR User Missing in System', errorMessage)
        }
    }, [error])

    if (loading) return <Loading id="screen-body-loading"/>

    if (error) return <ErrorPage className={"screen-body-error"} errorMessage={error.message}/>

    return (
        <FlexContentBody id={`qa-form__${classSfx}`} column>
            <DataProvider user={systemUser} appID={appID}>
                {!aiEnabled && (
                    <QAFormProvider 
                        userData={{ 
                            qrID: systemUser?.qrID ?? "N/A", 
                            siteName: systemUser?.siteName ?? "N/A" 
                        }} 
                        appID={appID} 
                        formFields={formFields}
                    >
                        {children}
                    </QAFormProvider>
                )}
                {aiEnabled && (
                    <QAFormAIProvider 
                        userData={{ 
                            qrID: systemUser?.qrID ?? "N/A", 
                            siteName: systemUser?.siteName ?? "N/A" 
                        }} 
                        appID={appID} 
                        formFields={formFields}
                    >
                        {children}
                    </QAFormAIProvider>
                )}
            </DataProvider>
        </FlexContentBody>
    )
}

export default QAScreenBody