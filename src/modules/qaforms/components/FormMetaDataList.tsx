import { FC } from "react"
import { FormMetadata, FormMode } from "../../../lib/types/forms.types"
import List from "@nielsen-media/maf-fc-list"
import { PhoneFillIcon, UserCircleFillIcon } from "@nielsen-media/maf-fc-icons"
import { useFormContext } from "../base/form.context"
import { useEditContext } from "../../edit-forms/base/edit.context"
import { formatDateTime } from "../../../lib/utils/formatDateTime"
import { TableData } from "@nielsen-media/maf-fc-table2"
import { useAIFormContext } from "../base/formAI.context"

interface CurrentFormMetaDataProps {
    mode: FormMode
    aiEnabled?: boolean
    readonlyData?: TableData
}

export const CurrentFormMetaData: FC<CurrentFormMetaDataProps> = ({ mode, aiEnabled, readonlyData }) => {
    const ref = () => {
        switch(mode) {
            case 'new': {
                const { activeForm } = useFormContext()
                
                return {
                    recordDate: activeForm.metadata.recordDate,
                    recordTime: activeForm.metadata.recordTime,
                    qrID: activeForm.metadata.qrID,
                    siteName: activeForm.metadata.siteName
                }
            }

            case 'ai': {
                const { activeForm } = useAIFormContext()
                
                return {
                    recordDate: activeForm.metadata.recordDate,
                    recordTime: activeForm.metadata.recordTime,
                    qrID: activeForm.metadata.qrID,
                    siteName: activeForm.metadata.siteName
                }
            }

            case 'edit': {
                const { form } = useEditContext()
                const fullDateISO = `${form.record_date}T${form.record_time}`
                const { formattedDate, formattedTime } = formatDateTime(new Date(fullDateISO))
                
                return {
                    recordDate: formattedDate,
                    recordTime: formattedTime,
                    qrID: form.qr_id,
                    siteName: form.site_name_id
                }
            }

            case 'readonly': {
                const fullDateISO = `${readonlyData.record_date}T${readonlyData.record_time}`
                const { formattedDate, formattedTime } = formatDateTime(new Date(fullDateISO))

                return {
                    recordDate: formattedDate,
                    recordTime: formattedTime,
                    qrID: readonlyData.qr_id,
                    siteName: readonlyData.site_name_id
                }
            }
        }
    }
    const metaDataRef: FormMetadata = ref()
    
    return (
        <List className="current form-details__metadata" size='regular' groupDirection='row' hasDivider>
            <List.Item className='record-date' data-selector='record_date' body={metaDataRef.recordDate} heading={"Record Date"} />
            <List.Item className='record-time' data-selector='record_time' body={metaDataRef.recordTime} heading={"Record Time"} />
            <List.Item className='qr-id' data-selector='qr_id' body={metaDataRef.qrID} heading={"QR ID"} icon={UserCircleFillIcon} />
            <List.Item className='site-name' body={metaDataRef.siteName} heading={"Site Name"} icon={PhoneFillIcon} />
            {/* {['new', 'ai'].includes(mode) && <List.Item className='site-name' body={metaDataRef.siteName} heading={"Site Name"} icon={PhoneFillIcon} />} */}
        </List>
    )
}

