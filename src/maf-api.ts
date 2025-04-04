import type { MAFInterface } from '@nielsen-media/maf-frontend-layer'

export const FOUNDATION_ID = '#starter-react-based'

export const mafApi = window.maf as MAFInterface

const useMAFContext = mafApi.useMAFContext

// getRegisterAppModule - function contains parameters common parameters for all screens in application (all parameters are optional)
const registerModule = mafApi.getRegisterAppModule({
  changelog: require('../CHANGELOG.md?raw'),
  appStateScheme: {
    someParam: 'number',
    count: 'number',
    tab: 'string',
  },
  //routeOverrides: {
    // Example of how we can override routes utilized by applications, such as internal widgets, at the screen level.
    // {'/originalApp/originalScreen': '/overwrittenApp/overwrittenScreen'}
    //'/someExternalApp1/someExternalScreen1': '/maf/notifications',
  //},
  //wrapper: Apollo, // Put Wrapper component here that will be persisted per different screens inside application
  helpMetadata: {
    link: 'https://www.nielsen.com/', // Add a help icon for all the application screens
  },
})

export { useMAFContext, registerModule }
