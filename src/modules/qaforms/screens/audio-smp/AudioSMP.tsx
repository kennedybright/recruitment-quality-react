import { FC } from 'react'
import '../../../../i18n'
import { RegisterModule, useMAFContext, FOUNDATION_ID, queryClient } from '../../../../maf-api'
import { aliasTokens, Foundation } from '@nielsen-media/maf-fc-foundation'
import { WarningFillIcon } from '@nielsen-media/maf-fc-icons'
import QAFormHeader from '../../base/QAScreenHeader'
import QAScreenBody from '../../base/QAScreenBody'
import { FlexWrapper800 } from '../../../../lib/shared.styles'
import { Footer } from '../../../../lib/components/layout/AppFooter'
import { QueryClientProvider } from 'react-query'
import AudioSMPQAForm from './components/FormAudioSMP'

const QAFormAudioSMP: FC = () => {
    const { 
        selectors: { useNavigate },
        notifier: { dialog }
    } = useMAFContext()

    useNavigate((confirm, cancel) => {
        dialog.show('Are you sure that you want to leave?', {
            icon: WarningFillIcon,
            variant: dialog.variant.warning,
            message: 'You have started monitoring. Current changes you made may not be saved.',
            buttons: {
                confirm: {
                    onClick: () => {
                        console.log("Exiting Audio/SMP QA monitoring form...")
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
            <FlexWrapper800 id='ccqa' className='qa-form-monitoring' column gap={aliasTokens.space600}>
                <QAFormHeader 
                    title="Audio & SMP QA Monitoring Form" 
                    subtitle="Tracking the compliance of phone calls made by RIs to households being initially recruited for Audio PPM & Diary, and SMP."
                />
                
                <QueryClientProvider client={queryClient}>
                    <QAScreenBody classSfx='audio-smp' appID={1001}>
                        <AudioSMPQAForm mode='new' />
                    </QAScreenBody>
                </QueryClientProvider>
                
                <Footer />
            </FlexWrapper800>
        </Foundation>
    )
}

RegisterModule(QAFormAudioSMP)
export default QAFormAudioSMP
