import { FC, useEffect } from 'react'
import { FlexContentBody } from '../../shared.styles'
import { DataProvider } from '../../context/data.context'
import { useMAFContext } from '../../../maf-api'
import { DynamicProviderLoader } from '../../../lib/context/providerLoader'
import { ErrorPage } from '../feedback/Error'
import { Loading } from '../feedback/LoaderSpinner'
import { ProviderRegistry } from '../../../lib/context/providerRegistry'
import { useCurrentUser } from '../../maf-api/hooks/user.hooks'
import { emailErrorReport } from '../../../lib/maf-api/services/email.service'

interface BaseScreenBodyProps {
    providerName?: keyof typeof ProviderRegistry 
    appID?: 'all' | undefined | number[] | number
}

const ScreenBody: FC<BaseScreenBodyProps> = ({ providerName, appID, children }) => {
    const { 
        selectors: { useUserData }, 
        notifier: { banner } 
    } = useMAFContext()
    const { firstName, lastName, email } = useUserData()
    const userFullName = `${firstName} ${lastName}`

    const { data: systemUser, isLoading: userLoading, error: userError, isFetched: userFetched } = useCurrentUser(email)

    useEffect(() => {
        if (userError) {
            banner.show(
                `No QRID found for user: ${userFullName}. The Contact Center Quality Team Manager has been notified.`,
                { variant: banner.variant.warning }
            )
            const errorMessage = `Our system was unable to locate <strong>${userFullName}</strong> in the Contact Center's QR database. Please verify the information
            and take any necessary action to ensure they are properly added to the system. Let us know if you need further assistance. See API error: ${userError.message}`
            emailErrorReport(userFullName, 'QR User Missing in System', errorMessage)
        }
    }, [userError])

    if (userLoading || !systemUser) return <Loading id="screen-body-loading" />

    if (userError) return <ErrorPage className={"screen-body-error"} errorMessage={userError.message}/>

    if (userFetched && !systemUser) {
        banner.show(
            `No QRID found for user: ${userFullName}. The Contact Center Quality Team Manager has been notified.`,
            { variant: banner.variant.warning }
        )
    }

    return (
        <FlexContentBody className={`page-body`} column>
            <DataProvider appID={appID} user={systemUser}>
                <DynamicProviderLoader providerName={providerName}>
                    {children}
                </DynamicProviderLoader>
            </DataProvider>
        </FlexContentBody>
    )
}

export default ScreenBody