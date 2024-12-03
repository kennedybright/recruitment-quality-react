import React from 'react'
import Text from '@nielsen-media/maf-fc-text'
import { useMAFContext } from '../../../../maf-api'
import Flex from '@nielsen-media/maf-fc-flex'
import Button from '@nielsen-media/maf-fc-button'

const APIServerMessage = () => {
  const {
    selectors: { useAppMessage },
  } = useMAFContext()
  const { message, markAsRead } = useAppMessage()

  return (
    <Flex column>
      <Text externalAs='pre'>{JSON.stringify(message, null, 2)}</Text>
      <Button onClick={() => markAsRead()}>Mark As Read</Button>
    </Flex>
  )
}

export default APIServerMessage
