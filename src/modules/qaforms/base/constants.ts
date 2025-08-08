import { FieldCatg } from "../../../lib/types/forms.types"

export const RISHIFT: FieldCatg[] = [ 
    { label: 'Day', value: 'Day' }, 
    { label: 'Night', value: 'Night' } 
]

export const AUDIOSMP: FieldCatg[] = [ 
    { label: 'Audio', value: 'Audio' }, 
    { label: 'SMP', value: 'SMP' } 
]

export const DISPOSITION: FieldCatg[] = [ 
    { label: "Correct", value: "CORRECT" }, 
    { label: "Incorrect", value: "INCORRECT" } 
]

export const CALLDIRECTION: FieldCatg[] = [ 
    { label: 'Inbound', value: 'IN'}, 
    { label: 'Outbound', value: 'OUT'} 
]

export const AUDIOSMPSCORING: FieldCatg[] = [ 
    { label: "-1", value: -1 }, 
    { label: "0", value: 0 }, 
    { label: "1", value: 1 } 
]

export const DEVIATIONCATEGORY: FieldCatg[] = [ 
    { label: "Failed", value: -1 }, 
    { label: "Validation Needed", value: 0 }, 
    { label: "Passed", value: 1 } 
]

export const YESNO = { 
    Yes: true, 
    No: false 
}

export const CALLCOUNTERTABLECOLS = [
    { header: 'RI ID', accessorKey: 'riID' },
    { header: 'Total Count', accessorKey: 'totalCount' },
    { header: 'Live', accessorKey: 'live' },
    { header: 'Non-Live', accessorKey: 'nonlive' },
]

export const FORMERRORTABLECOLS = [
    { header: 'Form ID', accessorKey: 'formID' },
    { header: 'Error', accessorKey: 'error' },
    { header: 'Error Field/Value', accessorKey: 'errorContext' },
]

export const FORMCHANGETABLECOLS = [
    { header: 'Form ID', accessorKey: 'form_id' },
    { header: 'Field ID', accessorKey: 'field_id' },
    { header: 'Field Name', accessorKey: 'field_name' },
    { header: 'Old Value', accessorKey: 'old_value' },
    { header: 'New Value', accessorKey: 'new_value' },
]