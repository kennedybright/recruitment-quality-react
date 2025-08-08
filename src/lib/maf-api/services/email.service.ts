// APIs for Email & Other Communication Services

import { blobToBase64 } from '../../../lib/utils/reports/formatReport'
import { isProd, TECH_SUPPORT_ADMIN } from '../../env'
import axiosInstance from '../client/axiosInstance'

// Trigger an email when an error occurs
export const emailErrorReport = async(systemUser: string, subject: string, error: string): Promise<{}> => {
    const recipients = TECH_SUPPORT_ADMIN.email
    const { data } = await axiosInstance.post('/emailErrorReport',
        { 
            emailTo: recipients,
            user: systemUser,
            subj: subject,
            errorMessage: error
        }
    )
    return data
}

// Trigger an email to RI team/manager when a daily report is generated
export const emailReport = async(
    recipients: string[], 
    pdfBlob: Blob, 
    report: string, 
    pdfFilename: string, 
    qrID: string, 
    riID: string
): Promise<{}> => {
    const base64PDF = await blobToBase64(pdfBlob)
    const { data } = await axiosInstance.post('/emailReport',
        {
            emailTo: isProd ? recipients : TECH_SUPPORT_ADMIN.email,
            pdfBase64: base64PDF,
            filename: pdfFilename,
            name: report,
            ri: riID,
            qr: qrID
        }
    )
    return data
}