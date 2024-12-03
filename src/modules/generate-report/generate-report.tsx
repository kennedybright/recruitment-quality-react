import React, { Suspense, useState } from 'react'
import styled from 'styled-components'
import Text from '@nielsen-media/maf-fc-text'
import Flex from '@nielsen-media/maf-fc-flex'
import Tabs from '@nielsen-media/maf-fc-tabs'
import { InlineSpinner } from '@nielsen-media/maf-fc-spinner'
import Link from '@nielsen-media/maf-fc-link'
import { aliasTokens, Foundation, JSONObject } from '@nielsen-media/maf-fc-foundation'
import { registerModule, useMAFContext } from '../../maf-api'
import { useQuery } from '@apollo/client'
import { READ_ALL_RATES } from '../qaforms-audio-smp/shared/apollo'
import { useTranslation } from 'react-i18next'
import { Code, StyledTile } from './styles'
import CodeCard from '../qaforms-audio-smp/code-card'
import '../../i18n'
import { FlexHeaderSection, FlexSection, FlexWrapper, FlexWrapperHeaderBtnGroup } from '../qaforms-audio-smp/styles'
import Button from '@nielsen-media/maf-fc-button'
import { CloseIcon } from '@nielsen-media/maf-fc-icons'
import { Tile } from '@nielsen-media/maf-fc-tile/dist/types/src/tile'
import { SingleSelect } from '@nielsen-media/maf-fc-select'

const FOUNDATION_ID = "#starter-react-based"

interface GenerateNewReportProps {
  className: string
}
const GenerateNewReport: React.FC<GenerateNewReportProps> = ({ className }) => {
  const {
    actions: { navigate },
    selectors: { useAppState, useAppPath },
  } = useMAFContext()

  const { t } = useTranslation()
  const [appId, screenId] = useAppPath()

  const { step: initialStep = 0, report: initialReport = '' } = useAppState()
  const [report, setReport] = useState<string>(initialReport)
  const [step, setStep] = useState<number>(initialStep)

  const handleTileClick = (report: string) => {
    setReport(report)
    setStep(1)
    console.log("Picked ", report)
  }

  const nextStep = () => { setStep((prevStep) => prevStep + 1) }
  const prevStep = () => { setStep((prevStep) => prevStep - 1) }

  const { loading, error, data } = useQuery(READ_ALL_RATES)

  return (
    <Foundation
      id={FOUNDATION_ID}
      initConfig={{
        rootSelector: FOUNDATION_ID,
      }}
    >
      <FlexWrapper className={className} column gap={aliasTokens.space450} id='starter-react-based'>
        <FlexHeaderSection flexDirection='row' gap={aliasTokens.space500} id='page-header'>
            <Flex column gap={0} flexBasis='68%' id='page-header-text'>
            <Text externalAs='h1' fontSize={Text.FontSize.s900} fontWeight={Text.FontWeight.bold}>
                Generate New Reports
            </Text>
            <Text fontSize={Text.FontSize.s300} fontWeight={Text.FontWeight.regular}>
                Insert instructions
            </Text>
            </Flex>
            <FlexWrapperHeaderBtnGroup id='flex-btn' flexDirection='row' gap={aliasTokens.space300}>
              <Button className='exit'
                  type='button'
                  variant='primary'
                  size='compact'  
                  view='solid'
                  aria-label='page-top-exit'
                  roundedCorners='all'
                  icon={{
                      icon: CloseIcon,
                      iconPosition: 'left'
                  }}
                  //onClick={() => onExit}
              >
                  Exit
              </Button>
            </FlexWrapperHeaderBtnGroup>
        </FlexHeaderSection>
        <Flex>
        <FlexWrapper className='report-grid' column gap={aliasTokens.space500} id='report-grid'>
          <FlexSection className='report-header'>
            <Text className='generate-report-title' externalAs='h3' fontSize={Text.FontSize.s800} fontWeight={Text.FontWeight.bold}>
                Which report would you like to create?
            </Text>
          </FlexSection>
          <Flex className='report-body' flexDirection='row' gap={"100px"}>
            <div onClick={() => 
              handleTileClick('Call Monitoring Report')
            } style={{cursor: 'pointer'}}>
              <StyledTile 
                className='call-monitoring-report' 
                title='Call Monitoring Report' 
                subtitle='Daily Call Observation report to be emailed to Manager'
                size='regular'
                target="_self"
                href={`/${appId}/${screenId}/callmonitoring?${step}`}
                aria-pressed={report === 'Call Montioring Report' ? true : false}
                aria-selected={report === 'Call Montioring Report' ? true : false}
              />
            </div>
            <div onClick={() => handleTileClick('MCA Report')} style={{cursor: 'pointer'}}>
              <StyledTile 
                className='mca-report' 
                title='MCA Report' 
                subtitle='Daily MCA Observation report to be emailed to Manager'
                size='regular'
                target="_self"
                href={`/${appId}/${screenId}/mca?${step}`}
                aria-pressed={report === 'MCA Report' ? true : false}
                aria-selected={report === 'MCA Report' ? true : false}
              />
            </div>
          </Flex>
        </FlexWrapper>
        </Flex>
        <Text externalAs='h1' fontSize={Text.FontSize.s700}>
          {t('Sub (Internal) Screen Example')}
        </Text>
        <Text>URL state:</Text>
        <CodeCard>
          <Code>
            <Text>
              Application Id:&nbsp;
              <Text fontWeight={Text.FontWeight.bold} externalAs='code'>
                {appId}
              </Text>
              <br />
              Screen Id:&nbsp;
              <Text fontWeight={Text.FontWeight.bold} externalAs='code'>
                {screenId}
              </Text>
              <br />
              Additional Path:&nbsp;
              <Text fontWeight={Text.FontWeight.bold} externalAs='code'>
                {'-'}
              </Text>
              <br />
            </Text>
          </Code>
          {`const [appId, screenId, ...additionalPath] = useAppPath()`}
        </CodeCard>
        <Text externalAs='h3' fontSize={Text.FontSize.s500}>
          {t('Tabs component:')}
        </Text>
        <Text fontSize={Text.FontSize.s500}>
          {t('Active Tab will be setup according to URL query param (i.e. Screen State).')}
        </Text>
        <Tabs
          //selectedValue={tab}
          aria-label='Tabs with index'
          onChange={({ value }) => navigate({ appState: { tab: value } })}
        >
          <Tabs.TabPanel label='Tab 1' value='tab1' chipLabel={1}>
            <div>
              <Text fontSize={Text.FontSize.s500}>This is Tab: 1. </Text>
              <Link fontSize={Link.FontSize.s500} href='/usremoterecqa/react-based'>
                {t('Go to react-based screen')}
              </Link>
            </div>
          </Tabs.TabPanel>
          <Tabs.TabPanel label='Apollo' value='tab2'>
            <InlineSpinner loading={loading}>
            </InlineSpinner>
          </Tabs.TabPanel>
          <Tabs.TabPanel label='Tab 3' value='tab3'>
            {t('This is Tab: 3. Check URL query params.')}
          </Tabs.TabPanel>
        </Tabs>
      </FlexWrapper>
    </Foundation>
  )
}

registerModule(GenerateNewReport)
export default GenerateNewReport
