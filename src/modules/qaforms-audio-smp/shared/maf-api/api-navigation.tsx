import React from 'react'
import Menu from '@nielsen-media/maf-fc-menu'
import Text from '@nielsen-media/maf-fc-text'
import { useTranslation } from 'react-i18next'
import { useMAFContext } from '../../../../maf-api'
import Link from '@nielsen-media/maf-fc-link'

const emptyArray = []
const items = [
  {
    label: 'Sub-Screen ID: tab1',
    icon: { name: 'mobile' },
    value: 'tab1',
  },
  {
    label: 'Sub-Screen ID: tab2',
    icon: { name: 'people' },
    value: 'tab2',
  },
  {
    label: 'Sub-Screen ID: tab3',
    icon: { name: 'information' },
    value: 'tab3',
  },
  {
    label: 'Sub-Screen ID: additionalPath',
    icon: { name: 'information' },
    value: 'additionalPath',
  },
  {
    label: 'Public example',
    icon: { name: 'taxonomy' },
    value: 'public-example',
  },
  {
    label: 'Not created (error) page',
    icon: { name: 'error' },
    value: 'unknown-page',
  },
]

const APINavigation = () => {
  const {
    actions: { navigate },
  } = useMAFContext()

  const handleListItemClick = (event, { value: screenId }) => {
    if (screenId === 'public-example') {
      navigate('starter/public-example?someParam=123') // can be passed as string
      return
    }
    if (screenId === 'unknown-page') {
      navigate({
        appId: 'starter', // optional (no need if you left in same app)
        screenId: 'unknown-page',
        appState: { tab: screenId },
      })
      return
    }
    if (screenId === 'additionalPath') {
      navigate({
        appPath: ['starter', 'sub-internal', 'additionalPath'],
      })
      return
    }
    navigate({
      screenId: 'sub-internal',
      appState: { tab: screenId },
    })
  }

  const { t } = useTranslation()

  return (
    <>
      <Text>{t('This an example contain usages `navigate`:')}</Text>
      <Menu onClick={handleListItemClick} type={Menu.Type.text} values={emptyArray}>
        {items.map(item => (
          <Menu.Item value={item.value} key={item.value} label={item.label} />
        ))}
      </Menu>
      <Text>{t('Example of overwritten routes:')}</Text>
      <Link href='/someExternalApp1/someExternalScreen1' fontSize='s300' fontWeight='bold'>
        /someExternalApp1/someExternalScreen1 -{'>'} /maf/notifications (Application Level Overrides)
      </Link>
      <Link href='/someExternalApp2/someExternalScreen2' fontSize='s300' fontWeight='bold'>
        /someExternalApp2/someExternalScreen2 -{'>'} /maf/notifications (Screen Level Overrides)
      </Link>
    </>
  )
}

export default APINavigation
