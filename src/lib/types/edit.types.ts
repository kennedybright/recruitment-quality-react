import { Apps } from "./forms.types"

export type EditMode = 'single' | 'bulk'

export type FormChange = {
    form_id: number
    field_id: number
    field_name: string
    old_value: any
    new_value: any
}
  
export type QAAuditTransaction = (
    { record_number: number, ai_record_number?: never } |
    { record_number?: never, ai_record_number: number }
) & {
    app_id: keyof Apps
    audit_track: number[]
    field_id: number
    field_name: string
    old_value: string
    new_value: string
    created_by: string
    transaction_date: string
}
