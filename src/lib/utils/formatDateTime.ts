// Convert PickerDate values (Date | number) to YYYY-MM-DD
export function formatPickerAsDate(date: Date | number): string {
    if (!date) return ''
    return new Date(date).toISOString().split("T")[0]
}

// Format autopopulated Date & Time in the Current Form Details
export function formatDateTime(dateInput: Date | string): { formattedDate:string, formattedTime:string } {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone // get current user's timezone
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput // get current user's local date & time

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date)

    const formattedTime = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(date)

    return { formattedDate, formattedTime }
}

export function formatTimestamp(timestamp: Date, tz: string): string {
    const formattedTimestamp = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(timestamp)

    console.log("formatted timestamp: ", formattedTimestamp)
    return formattedTimestamp
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

export function toZonedTimestamp(date: Date, timezone: string): string {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    })
        .formatToParts(date)
        .reduce((acc, part) => {
            if (part.type !== 'literal') acc[part.type] = part.value
            return acc
        }, {} as Record<string, string>)

    const { year, month, day, hour, minute, second } = parts
    const utcDate = new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`)
    console.log(`${date} To timezone [${timezone}]: ${utcDate.toISOString()}`)
    return utcDate.toISOString()
}