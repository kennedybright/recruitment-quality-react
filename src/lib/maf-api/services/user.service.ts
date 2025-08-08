// APIs for User Data

import { SystemUser } from '../../types/global.types'
import axiosInstance from '../client/axiosInstance'

// Fetch user data for the current system user by username (email address)
export const fetchCurrentUser = async(username: string): Promise<SystemUser> => {
    const { data } = await axiosInstance.get('/employees/qa', {
        params: { email_address: username }
    })
    return {
        fullName: data[0]?.full_name || "",
        emailAddress: data[0]?.email_address || "",
        qrID: data[0]?.qr_id || "",
        siteName: data[0]?.site_name_id || "",
        lob: data[0]?.lob || "",
        costCenter: data[0]?.cost_center || "",
        teamLead: data[0]?.team_lead || "",
        biligual: data[0]?.biligual || "",
    }
}

// Fetch user data of all QR's
export const fetchAllQR = async(): Promise<SystemUser> => {
    const { data } = await axiosInstance.get('/employees/qa')
    return {
        fullName: data[0]?.full_name || "",
        emailAddress: data[0]?.email_address || "",
        qrID: data[0]?.qr_id || "",
        siteName: data[0]?.site_name_id || "",
        lob: data[0]?.lob || "",
        costCenter: data[0]?.cost_center || "",
        teamLead: data[0]?.team_lead || "",
        biligual: data[0]?.biligual || "",
    }
}

// Fetch the user data for the QR Team Manager
export const fetchQRManager = async(): Promise<{}> => {
    const { data } = await axiosInstance.get('/employees/qa', {
        params: { title: 'Group Leader' }
    })
    return {
        fullName: data[0]?.full_name || "",
        emailAddress: data[0]?.email_address || "",
        qrID: data[0]?.qr_id || "",
        siteName: data[0]?.site_name_id || "",
    }
}