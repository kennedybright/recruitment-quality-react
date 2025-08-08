import { FC } from 'react'
import '../../i18n'
import { RegisterModule, useMAFContext, FOUNDATION_ID, queryClient } from '../../maf-api'
import { FlexWrapper800 } from '../../lib/shared.styles'
import { aliasTokens, Foundation } from '@nielsen-media/maf-fc-foundation'
import { WarningFillIcon } from '@nielsen-media/maf-fc-icons'
import ScreenHeader from '../../lib/components/layout/ScreenHeader'
import ScreenBody from '../../lib/components/layout/ScreenBody'
import { Footer } from '../../lib/components/layout/AppFooter'
import EditFormsBody from './base/PageBody'
import { QueryClientProvider } from 'react-query'

const EditForms: FC = () => {
    const { 
        selectors: { useNavigate },
        notifier: { dialog }
    } = useMAFContext()

    useNavigate((confirm, cancel) => {
        dialog.show('Are you sure that you want to leave?', {
            icon: WarningFillIcon,
            variant: dialog.variant.warning,
            message: 'You have started editing forms. Current changes you made may not be saved.',
            buttons: {
                confirm: {
                    onClick: () => {
                        console.log("Exiting Edit Forms...")
                        confirm()
                    },
                    text: 'Proceed',
                },
                cancel: {
                    onClick: () => cancel(),
                    text: 'Cancel',
                },
            },
        })
    })

    return (
        <Foundation
            id={FOUNDATION_ID}
            initConfig={{ rootSelector: FOUNDATION_ID }}
        >
            <FlexWrapper800 id='ccqa' className='edit-forms' column gap={aliasTokens.space450}>
                <ScreenHeader 
                    title="Edit Forms" 
                    subtitle="Modify QA monitoring forms individually or across multiple records, review changes, and save all edits in real time."
                />

                <QueryClientProvider client={queryClient}>
                    {/* Edit Forms Body - All steps */}
                    <ScreenBody providerName={'EditProvider'} appID={'all'}>
                        <EditFormsBody />
                    </ScreenBody>
                </QueryClientProvider>
                
                <Footer />
            </FlexWrapper800>
        </Foundation>
    )
}

RegisterModule(EditForms)
export default EditForms