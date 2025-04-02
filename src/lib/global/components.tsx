import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'
import { FlexLoading } from '../../modules/qaforms/qaforms-audio-smp/styles'
import { aliasTokens } from '@nielsen-media/maf-fc-foundation'
import { FlexFooter } from './styles'
import Link from '@nielsen-media/maf-fc-link'
import { InlineSpinner } from '@nielsen-media/maf-fc-spinner'
import Button from '@nielsen-media/maf-fc-button'
import { ArrowDownIcon } from '@nielsen-media/maf-fc-icons'

// Global Page Footer
export const Footer = () => (
  <FlexFooter id='page-footer' column gap={aliasTokens.space300}>
      <Text textAlign='center' color={aliasTokens.color.neutral700} fontSize='s0' fontWeight='regular'>
          Copyright © 2024 The Nielsen Company (US), LLC.<br />All Rights Reserved. Confidential and Proprietary.
      </Text>
      <Flex flexDirection='row' gap={aliasTokens.space800} alignSelf='center'>
      <Link fontWeight="bold" href="https://www.nielsen.com" target="_blank" variant="secondary" fontSize='s100'
      >
          Terms of Use
      </Link>
      <Link fontWeight="bold" href="https://www.nielsen.com/us/en/legal/privacy-statement/" target="_blank" variant="secondary" fontSize='s100'
      >
          Privacy Policy
      </Link>
      </Flex>
  </FlexFooter>
)

// Global Loading component
export const Loading = ({className}) => (
  <Flex className={className} column alignItems='center' justifyContent='center'>
      <FlexLoading>
          <InlineSpinner aria-label="Loading" loading isFillParent/>
      </FlexLoading>
  </Flex>
)

// Global Button to download data to .csv file
export const DownloadCsvButton = ({classPfx, filename, data}) => {
    const convertToCSV = (arr) => {
        const array = [Object.keys(arr[0])].concat(arr)
    
        return array.map((row) => {
            return Object.values(row).map((value) => {
                if (typeof value === 'string') {
                    // Escape double quotes and wrap in double quotes
                    return `"${value.replace(/"/g, '""')}"`
                }
                return value
            })
            .join(',') // Comma delimiter
        })
        .join('\n') // New line
    }

    const downloadCSV = () => {
        if (!data || data?.length === 0) {
          console.log('No data to download.')
          return
        }
    
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url) // Clean up the URL object
        document.body.removeChild(a) // Clean up the link
    }
    
    return (
        <Button
            className={`${classPfx}-download-btn`}
            size='compact'
            roundedCorners='all'
            variant='primary'
            view='solid'
            icon={{
                icon: ArrowDownIcon,
                iconPosition: 'right'
            }}
            onClick={downloadCSV}
        >
            Download
        </Button>
    )
}