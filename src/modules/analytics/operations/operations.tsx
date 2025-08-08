import { FC } from 'react'
import '../../../i18n'
import { RegisterModule, useMAFContext, FOUNDATION_ID, queryClient } from '../../../maf-api'
import { FlexWrapper800 } from '../../../lib/shared.styles'
import { aliasTokens, Foundation } from '@nielsen-media/maf-fc-foundation'
import { WarningFillIcon } from '@nielsen-media/maf-fc-icons'
import ScreenHeader from '../../../lib/components/layout/ScreenHeader'
import ScreenBody from '../../../lib/components/layout/ScreenBody'
import { Footer } from '../../../lib/components/layout/AppFooter'
import { ACMReport } from './reports/reportACM'
import { LCMReport } from './reports/reportLCM'
import { QueryClientProvider } from 'react-query'

const Operations: FC = () => {
    const { 
        selectors: { useNavigate, useUIToggles },
        notifier: { dialog }
    } = useMAFContext()

    // UI toggle indication for ACM viewer access
    const seeACM = useUIToggles("CCQA_ANALYTICS_OPERATIONS_VIEWACM")

    useNavigate((confirm, cancel) => {
        dialog.show('Are you sure that you want to leave?', {
            icon: WarningFillIcon,
            variant: dialog.variant.warning,
            buttons: {
                confirm: {
                    onClick: () => {
                        console.log("Exiting Operations Dashboard...")
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
            <FlexWrapper800 id='ccqa' className='operations-dashboard' column gap={aliasTokens.space450}>
                <ScreenHeader title="Operations Dashboard" align='center'/>

                <QueryClientProvider client={queryClient}>
                    {/* Operations Body - All Reports */}
                    <ScreenBody appID={'all'}>
                        <LCMReport />
                        {seeACM && <ACMReport />}
                    </ScreenBody>
                </QueryClientProvider>

                <Footer />
            </FlexWrapper800>
        </Foundation>
    )
}

RegisterModule(Operations)
export default Operations