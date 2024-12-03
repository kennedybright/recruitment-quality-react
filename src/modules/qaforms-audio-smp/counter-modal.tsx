import React, { FC } from 'react'
import Modal from '@nielsen-media/maf-fc-modal'
import Text from '@nielsen-media/maf-fc-text'
import { aliasTokens, useFoundation } from '@nielsen-media/maf-fc-foundation'

const CounterModal: FC<{ getValues: Function; opened?: boolean }> = ({ getValues, ...props }) => {
  const { unmountSingle } = useFoundation("#maf-starter-based")
  return (
    <Modal {...props} title='Counter' onClose={unmountSingle}>
      <Text externalAs='div'>
        Example of modal with dynamic state:&nbsp;
        <Text color={aliasTokens.color.success500} fontWeight={Text.FontWeight.bold}>
          {getValues('count')}
        </Text>
      </Text>
    </Modal>
  )
}

export default CounterModal
