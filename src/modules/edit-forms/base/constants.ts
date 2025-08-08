import { EditMode } from "../../../lib/types/edit.types"

export const EDITMODES: Record<EditMode, string> = {
    "single": 'Single Mode',
    "bulk": 'Bulk Mode'
}

export const CHECKBOXOPTIONS = [ 
    {label: "Yes", value: true as unknown as "true"}, 
    {label: "No", value: false as unknown as "false"}
]

export type EditField = {
    label: string
    type: string
}