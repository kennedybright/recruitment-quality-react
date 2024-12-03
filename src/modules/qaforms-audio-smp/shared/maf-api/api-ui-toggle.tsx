import React from 'react'
import Grid from '@nielsen-media/maf-fc-grid'
import Input from '@nielsen-media/maf-fc-input'
import Text from '@nielsen-media/maf-fc-text'
import { useMAFContext } from '../../../../maf-api'
import { useForm } from 'react-hook-form'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { StyledInput } from '../../styles'
import { useTranslation } from 'react-i18next'

const ApiUiToggle = () => {
  // MAF API
  const {
    selectors: { useUIToggles },
  } = useMAFContext()

  // react-hook forms
  const { control, watch } = useForm<{
    uiToggle: string
  }>({
    defaultValues: {
      uiToggle: 'INFRA-DEBUG',
    },
    mode: 'onChange',
  })

  // Subscribe on changes of hook form values
  const uiToggle = watch('uiToggle')
  const hasUIToggle = useUIToggles(uiToggle)

  const { t } = useTranslation()

  return (
    <Grid gridTemplateColumns='max-content 150px max-content' alignItems='center' gap={aliasTokens.space200}>
      <Text whiteSpace='nowrap'>{t('UI Toggle:')}</Text>
      <StyledInput
        hookForm={{
          //control,
          name: 'uiToggle',
        }}
        size={Input.Size.compact}
      />
      <Text>= {`${hasUIToggle}`}</Text>
    </Grid>
  )
}

export default ApiUiToggle
