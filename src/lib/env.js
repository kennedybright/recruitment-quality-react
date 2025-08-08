// Define environment variables (DEV, PROD) for the Alpha and Prod sites

export const API_BASE_URL = window.location.origin
export const ENV = API_BASE_URL.includes(".dev") ? "DEV" : "PROD"
export const isDev = ENV === 'DEV'
export const isProd = ENV === 'PROD'

// Tech support admin contact for entire application. Update as needed.
export const TECH_SUPPORT_ADMIN = {
    name: "Kennedy Bright", 
    email: "kennedy.bright@nielsen.com",
    team: "GDS Performance Management"
}