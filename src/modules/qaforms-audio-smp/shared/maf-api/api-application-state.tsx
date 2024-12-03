import React, { useEffect } from 'react'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import ActionIcon from '@nielsen-media/maf-fc-action-icon'
import CounterModal from '../../counter-modal'
import { useForm } from 'react-hook-form'
import { useMAFContext } from '../../../../maf-api'
import { useTranslation } from 'react-i18next'
import { StyledInput } from '../../styles'
import { aliasTokens, useFoundation } from '@nielsen-media/maf-fc-foundation'
import { CaretLeftIcon, CaretRightIcon, SortIcon } from '@nielsen-media/maf-fc-icons'

const APIApplicationState = () => {
  const FOUNDATION_ID = '#starter-react-based'

  // MAF API
  const {
    actions: { navigate },
    selectors: { useAppState, useFeatureHighlight },
  } = useMAFContext()

  // API of foundation that mounts singleton element to the application can be used by modals, dialogs, etc...
  // and other components that can only on instance on the screen in current time
  const { mountSingle } = useFoundation(FOUNDATION_ID)

  // react-form
  const { control, setValue, getValues } = useForm({ defaultValues: { count: 0 } })

  const { count = 0 } = useAppState()

  useEffect(() => {
    setValue('count', count)
  }, [count, setValue])

  function handleDecrementCount() {
    const count = Number(getValues('count')) - 1
    setValue('count', count)
    navigate({ appState: { count } })
  }

  function handleIncrementCount() {
    const count = Number(getValues('count')) + 1
    setValue('count', count)
    navigate({ appState: { count } })
  }

  const { t } = useTranslation()

  return (
    <>
      <Text>
        {t(`It shows how to useAppState (please check query string params at url). Try to
          change Counter and refresh page - you'll see that Counter persist previous value.`)}
      </Text>
      <Flex alignItems='center' gap={aliasTokens.space200}>
        <ActionIcon icon={CaretLeftIcon} onClick={handleDecrementCount} color={aliasTokens.color.black} />
        <StyledInput
          hookForm={{
            // control,
            name: 'count',
            rules: {
              validate: value => isNaN(value) && `"${value}" should be number`,
            },
          }}
          onChange={event => {
            navigate({ appState: { count: Number(event.target.value) } })
          }}
          size={StyledInput.Size.compact}
        />
        <ActionIcon icon={CaretRightIcon} onClick={handleIncrementCount} color={aliasTokens.color.black} />
          <ActionIcon
            icon={SortIcon}
            color={aliasTokens.color.black}
            onClick={() => mountSingle(CounterModal, { getValues })}
          />
      </Flex>
    </>
  )
}

export default APIApplicationState
