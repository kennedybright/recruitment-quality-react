import { TableData } from "@nielsen-media/maf-fc-table2"
import { formatTimestamp } from "../formatDateTime"
import { EditMode, FormChange, QAAuditTransaction } from "../../types/edit.types"

// Custom hook function to generate audit transactions list and format edited forms for submission 
export function buildEditsSubmission(
    qr:string, 
    appID:number, 
    mode:EditMode, 
    forms:TableData[]|TableData, 
    changes:FormChange[], 
    auditTracking:number[]
): {finalForms:[], finalDeletions:number[], finalChanges:QAAuditTransaction[]} {
    const finalForms: [] = mode === "single"
        ? [{ ...forms, app_id: appID, created_by: qr, updated_by: qr, updated_date: formatTimestamp(new Date(), 'America/Chicago')}] // CST timezone
        : forms.map((form) => {
            return { 
                ...form, 
                app_id: appID,
                updated_by: `${qr}`,
                updated_date: formatTimestamp(new Date(), 'America/Chicago') // CST timezone
            }
        })
    
    const finalChanges = changes.map((change) => {
            const updatedChange: QAAuditTransaction = {
                record_number: change.form_id,
                app_id: appID,
                audit_track: auditTracking,
                field_id: change.field_id,
                field_name: change.field_name,
                old_value: change.old_value === "NULL" ? null : change.old_value,
                new_value: change.new_value === "NULL" ? null : change.new_value,
                created_by: `${qr}`,
                transaction_date: formatTimestamp(new Date(), 'America/Chicago') // CST timezone
            }
        return updatedChange
    })

    const finalDeletions = finalChanges.filter((change) => change.new_value === "FORM DELETED")?.map((change) => change.record_number)
    console.log("forms, deletions, changes:", finalForms, finalDeletions, finalChanges)
    return { finalForms, finalDeletions, finalChanges }
}

// Custom hook function to generate AI audit transactions list for submission 
export function buildAIEditsSubmission(
    qr:string, 
    appID:number, 
    changes:FormChange[], 
    auditTracking:number[]
): QAAuditTransaction[] {
    const finalChanges = changes.map((change) => {
            const updatedChange: QAAuditTransaction = {
                ai_record_number: change.form_id,
                app_id: appID,
                audit_track: auditTracking,
                field_id: change.field_id,
                field_name: change.field_name,
                old_value: change.old_value === "NULL" ? null : change.old_value,
                new_value: change.new_value === "NULL" ? null : change.new_value,
                created_by: `${qr}`,
                transaction_date: formatTimestamp(new Date(), 'America/Chicago') // CST timezone
            }
        return updatedChange
    })

    console.log("changes:", finalChanges)
    return finalChanges
}