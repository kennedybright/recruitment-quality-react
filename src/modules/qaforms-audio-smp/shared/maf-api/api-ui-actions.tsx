import React, { useEffect } from 'react'
import Flex from '@nielsen-media/maf-fc-flex'
import Switch from '@nielsen-media/maf-fc-switch'
import { useMAFContext } from '../../../../maf-api'
import { useForm } from 'react-hook-form'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'

const APIUIActions = () => {
  // MAF API
  const {
    actions: { hideHeader, showHeader, showCompactSideMenu, hideCompactSideMenu, disableNavigation, enableNavigation },
  } = useMAFContext()

  // react-hook forms
  const { control, watch } = useForm<{
    header: boolean
    sideMenu: boolean
    disabledNavigation: boolean
  }>({
    defaultValues: {
      header: true,
      disabledNavigation: false,
      sideMenu: true,
    },
    mode: 'onChange',
  })

  // Subscribe on changes of hook form values
  const header = watch('header')
  const sidebar = watch('sideMenu')
  const disabledNavigation = watch('disabledNavigation')

  useEffect(() => {
    header ? showHeader() : hideHeader()
  }, [header, showHeader, hideHeader])

  useEffect(() => {
    sidebar ? showCompactSideMenu() : hideCompactSideMenu()
  }, [sidebar, showCompactSideMenu, hideCompactSideMenu])

  useEffect(() => {
    disabledNavigation ? disableNavigation() : enableNavigation()
  }, [disabledNavigation, enableNavigation, disableNavigation])

  return (
    <Flex gap={aliasTokens.space450}>
      <Switch
        label='Show Header'
        // Every component that has integration with hook forms can pass all hook form data here
        hookForm={{
          // control,
          name: 'header',
        }}
      />
      <Switch
        label='Show Compact SideMenu'
        // Every component that has integration with hook forms can pass all hook form data here
        hookForm={{
          // control,
          name: 'sideMenu',
        }}
      />
      <Switch
        label='Disable Navigation (Stepper Example)'
        // Every component that has integration with hook forms can pass all hook form data here
        hookForm={{
          // control,
          name: 'disabledNavigation',
        }}
      />
    </Flex>
  )
}

export default APIUIActions
