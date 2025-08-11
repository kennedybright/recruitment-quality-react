// Custom empty validation check for both arrays and/or objects
export function isEmpty(value): boolean {
    if (value) return (Array.isArray(value) && value.length === 0) || (!Array.isArray(value) && Object.keys(value).length === 0)
    return true
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Strip all special characters and spaces from the string input
export function sanitizeAlphaNumeric(value: string): string {
    return value.trim().replaceAll(/[^a-zA-Z0-9]/g, "")
}

// Get the type of string (either all-numbers, all-letters, or alphanumric)
export function getAlphaNumType(value: string) {
    if (/^[0-9]+$/.test(value)) return 0
    if (/^[a-zA-Z]+$/.test(value)) return 1
    return 2
}

export type FETCHSTATUS = 'idle' | 'loading' | 'no-data' | 'error' | 'success'

// Format value in string representation
export function formatTableValue(value: any): string {
    switch(typeof value) {
        case 'boolean': return `${value}`
        case 'number' : return String(value)
        case 'object' : return value ? JSON.stringify(value) : null
        case 'string' : return value
    }
}
