import { format, toZonedTime } from 'date-fns-tz'

// Convert PickerDate values (Date | number) to YYYY-MM-DD
export function formatPickerAsDate(date: Date | number): string {
    if (!date) return ''
    return new Date(date).toISOString().split("T")[0]
}

// Format autopopulated Date & Time in the Current Form Details
export function formatDateTime(date: Date | string): { formattedDate:string, formattedTime:string } {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone // get current user's timezone
    const localdate = toZonedTime(date, tz) // get current user's local date & time
    const formattedDate = format(localdate, 'MM/dd/yyyy')
    const formattedTime = format(localdate, 'hh:mm:ss aa')
    return { formattedDate, formattedTime }
}

// Convert 12-hour formatted times to 24-hour
export function convertTo24H(time12H:string): string {
    const [time, modifier] = time12H.split(' ')
    let [hrs, mins, secs] = time.split(':')

    if (modifier === "PM" && hrs !== '12') {
      hrs = String(parseInt(hrs, 10) + 12)
    } else if (modifier === "AM" && hrs === '12') {
      hrs = '00'
    }
    return `${hrs}:${mins}:${secs}`
}

// Return today's full report date in format: Sunday, Aug 10, 2024 3:34 PM 
export function getPrintDate(): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    return formatter.format(new Date())
}

// Custom empty validation check for both arrays and/or objects
export function isEmpty(value): boolean {
    if (value) return (Array.isArray(value) && value.length === 0) || (!Array.isArray(value) && Object.keys(value).length === 0)
    return true
}