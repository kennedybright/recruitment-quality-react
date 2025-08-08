import { isProd } from "../../../lib/env"

// Define all API routes dependent on environment
export const apiRoutes = {
    qa: {
        1001: {
            forms: isProd ? '/forms/audio/historical' : '/forms/temp/audio',
            audit: isProd ? '/forms/audio/audit' : '/forms/temp/audio/audit',
            aiForms: isProd ? '/forms/ai/audio/historical' : '/forms/temp/ai/audio',
            aiAudit: isProd ? '/forms/ai/audio/audit' : '/forms/temp/ai/audio/audit'
        },
        1002: {
            forms: isProd ? '/forms/tam/historical' : '/forms/temp/tam',
            audit: isProd ? '/forms/tam/audit' : '/forms/temp/tam/audit',
            aiForms: isProd ? '/forms/ai/tam/historical' : '/forms/temp/ai/tam',
            aiAudit: isProd ? '/forms/ai/tam/audit' : '/forms/temp/ai/tam/audit'
        }
    },
    report: {
        reportMCA: isProd ? '/reports/audio/mca' : '/reports/temp/audio/mca', 
        reportCMR: isProd ? '/reports/audio/cmr' : '/reports/temp/audio/cmr', 
        reportLCM: isProd ? '/reports/audio/lcm' : '/reports/temp/audio/lcm', 
        reportACM: isProd ? '/reports/audio/mca' : '/reports/temp/audio/acm' 
    }
}