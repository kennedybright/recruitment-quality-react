import { useEffect } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import { useMAFContext } from '../../../../maf-api'
import { useTranslation } from 'react-i18next'
import { dsHelper } from '@nielsen-media/maf-fc-foundation'

const APIAnalytics = () => {
  const {
    analytics: {
      heapMeasure: { hideTextElementsByCustomSelector },
    },
  } = useMAFContext()

  const ds = dsHelper('catch-element')
  const { t } = useTranslation()

  useEffect(() => {
    hideTextElementsByCustomSelector('[data-selector="catch-element__text"]')
  }, [])

  return (
    <>
      <Text {...ds('text')}>{t('Text to redact inside Heap analytics platform.')}</Text>
    </>
  )
}

export default APIAnalytics
