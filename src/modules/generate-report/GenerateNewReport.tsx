import { FC } from 'react'
import '../../i18n'
import { RegisterModule, useMAFContext, FOUNDATION_ID, queryClient } from '../../maf-api'
import { FlexWrapper800 } from '../../lib/shared.styles'
import { aliasTokens, Foundation } from '@nielsen-media/maf-fc-foundation'
import { WarningFillIcon } from '@nielsen-media/maf-fc-icons'
import ScreenHeader from '../../lib/components/layout/ScreenHeader'
import ScreenBody from '../../lib/components/layout/ScreenBody'
import GenerateReportBody from './base/PageBody'
import { Footer } from '../../lib/components/layout/AppFooter'
import { QueryClientProvider } from 'react-query'


const GenerateNewReport: FC = () => {
	const { 
		selectors: { useNavigate },
		notifier: { dialog }
	} = useMAFContext()

	useNavigate((confirm, cancel) => {
		dialog.show('Are you sure that you want to leave?', {
			icon: WarningFillIcon,
			variant: dialog.variant.warning,
			message: 'You have started generating a report. Current changes you made may not be saved.',
			buttons: {
				confirm: {
					onClick: () => {
						console.log("Exiting Generate New Reports...")
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
			<FlexWrapper800 id='ccqa' className='generate-new-reports' column gap={aliasTokens.space450}>
				<ScreenHeader 
					title="Generate New Reports" 
					subtitle="Select the type of daily report you wish to generate, review the details, and easily send it to the manager via email."
				/>

				<QueryClientProvider client={queryClient}>
					{/* Generate Report Body - All steps */}
					<ScreenBody providerName={'ReportProvider'} appID={'all'}>
						<GenerateReportBody />
					</ScreenBody>
				</QueryClientProvider>
				
				<Footer />
			</FlexWrapper800>
		</Foundation>
	)
}

RegisterModule(GenerateNewReport)
export default GenerateNewReport
