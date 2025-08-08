import type { MAFInterface, registerModule } from '@nielsen-media/maf-frontend-layer'
import { QueryClient } from "react-query"

export const FOUNDATION_ID = '#ccqa'
export const mafApi = window.maf as MAFInterface
export const useMAFContext = mafApi.useMAFContext

export const queryClient = new QueryClient()

export const RegisterModule: typeof registerModule = mafApi.getRegisterAppModule({
  changelog: require('../CHANGELOG.md?raw'),
  // appStateScheme: {
  //   someParam: 'number',
  //   count: 'number',
  //   tab: 'string',
  // },
  //routeOverrides: {
    // Example of how we can override routes utilized by applications, such as internal widgets, at the screen level.
    // {'/originalApp/originalScreen': '/overwrittenApp/overwrittenScreen'}
    //'/someExternalApp1/someExternalScreen1': '/maf/notifications',
  //},
  // wrapper: Query, // Put Wrapper component here that will be persisted per different screens inside application
  helpMetadata: {
    link: 'https://www.nielsen.com/', // Add a help icon for all the application screens
  },
})
