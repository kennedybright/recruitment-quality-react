import { InputItemOption } from "@nielsen-media/maf-fc-select"
import { FormChange } from "./edit.types"

export type AppID = number
export type App = {
    appName: string
    appLOB: string
}
export type Apps = Record<AppID, App>

export type FormFieldMap = Record<keyof Apps, FormField[]>

export interface FieldCatg extends InputItemOption {
    label: string
    value: string | number
    name?: string // Description/unabbreviated name
    siteNameID?: string // RI-specific property
    lob?: string // RI-specific property
    priority?: number // MCA-specific property
}

export type RI = {
    id: string
    lob: string
    siteNameID: string
    location: string
    riShift: string
    audioIVRs: string
    scarIVRs: string
    videoIVRs: string
}

export type FormMode = 'new' | 'ai' | 'edit' | 'readonly'

export type FormRef = Record<string, any> & {
  form_id?: number
}

export type FormField = {
    id: number
    label: string
    name: string
    fieldType: string
    value: any // Default value of the field
    isValid?: boolean // for form validation
    isRequired: boolean
}

export type FormMetadata = {
    recordDate: string
    recordTime: string
    qrID: string
    siteName: string
}
  
export type Form = {
    formID: number
    metadata: FormMetadata
    formRef: FormRef
    fields: FormField[]
}
  
export type QAForms = {
    forms: Form[]
    activeFormID: number | null
}

export type QAFormsAI = QAForms & {
    queryCache: Form[]
    formChanges: FormChange[]
}

export type FieldLogic = {
    field: string
    calltype: string
    audioSMP: string
    disabled: boolean
}

export type FormError = {
    formID: number
    error: string
    errorContext: string
}