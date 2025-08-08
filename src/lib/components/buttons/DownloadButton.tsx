import Button from '@nielsen-media/maf-fc-button'
import { ArrowDownIcon } from '@nielsen-media/maf-fc-icons'

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
        const csv = convertToCSV(data)
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
            className={`${classPfx}-btn__download`}
            size='compact'
            roundedCorners='all'
            variant='primary'
            view='solid'
            icon={{
                icon: ArrowDownIcon,
                iconPosition: 'right'
            }}
            onClick={downloadCSV}
            disabled={!data || data?.length === 0}
        >
            Download
        </Button>
    )
}