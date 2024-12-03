import React from 'react'
import Button from '@nielsen-media/maf-fc-button'
import Flex from '@nielsen-media/maf-fc-flex'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { useMAFContext } from '../../../../maf-api'
import { DataCubeIcon } from '@nielsen-media/maf-fc-icons'

const BannerNotification = () => {
  const {
    notifier: { banner: bannerNotifier },
  } = useMAFContext()
  return (
    <Button
      onClick={() =>
        bannerNotifier.show(`Today: ${new Date().toDateString()}, Time: ${new Date().toLocaleTimeString()}`, {
          variant: bannerNotifier.variant.warning,
        })
      }
    >
      Banner
    </Button>
  )
}

const NativeNotification = () => {
  const {
    notifier: { native: nativeNotifier },
  } = useMAFContext()
  return (
    <Button
      onClick={() =>
        nativeNotifier.show(`Today: ${new Date().toDateString()}`, {
          message: `Time: ${new Date().toLocaleTimeString()}`,
        })
      }
    >
      Native
    </Button>
  )
}

const ToastNotification = () => {
  const {
    notifier: { toast: toastNotifier },
  } = useMAFContext()
  return (
    <Button
      onClick={() =>
        toastNotifier.show(`Today: ${new Date().toDateString()}, Time: ${new Date().toLocaleTimeString()}`, {
          variant: toastNotifier.variant.success,
        })
      }
    >
      Toast
    </Button>
  )
}

const SystemBannerNotification = () => {
  const {
    notifier: { systemBanner: systemBannerNotifier },
  } = useMAFContext()
  return (
    <Button
      onClick={() =>
        systemBannerNotifier.show(`Today: ${new Date().toDateString()}`, `Time: ${new Date().toLocaleTimeString()}`, {
          actionButton: {
            onClick: () => alert('You did it!'),
            text: 'Click Me!',
          },
          variant: systemBannerNotifier.variant.error,
        })
      }
    >
      System Banner
    </Button>
  )
}

const DialogNotification = () => {
  const {
    notifier: { dialog: dialogNotifier },
  } = useMAFContext()
  return (
    <Button
      onClick={() =>
        dialogNotifier.show(`Notifier Info`, {
          icon: DataCubeIcon,
          size: 'jumbo',
          message: `Time: ${new Date().toLocaleTimeString()}`,
          buttons: {
            confirm: {
              onClick: () => console.log('You did it!'),
              text: 'Got it!',
            },
          },
        })
      }
    >
      Dialog
    </Button>
  )
}

const APINotifications = () => {
  return (
    <Flex gap={aliasTokens.space400} flexWrap='wrap'>
      <NativeNotification />
      <ToastNotification />
      <BannerNotification />
      <SystemBannerNotification />
      <DialogNotification />
    </Flex>
  )
}

export default APINotifications
