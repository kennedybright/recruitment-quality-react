import { FC } from "react"
import { Apps, FormMode } from "../../../lib/types/forms.types"
import { TableData } from "@nielsen-media/maf-fc-table2"
import AudioSMPQAForm, { AudioSMPFormProps } from "../screens/audio-smp/components/FormAudioSMP"
import AIAudioSMPQAForm from "../screens/audio-smp-ai/components/AIFormAudioSMP"
// import TAMVideoQAForm, { TAMVideoFormProps } from "../screens/tam-video/components/FormTAMVideo"

type Form<T> = { 
    component: (aiEnabled: boolean) => FC<T>
    getProps: (mode: FormMode, formID?: number, readonlyData?: TableData) => T
}

export const FormRegistry = {
    1001: {
        component: (ai: boolean) => ai ? AIAudioSMPQAForm : AudioSMPQAForm,
        getProps: (formMode: FormMode, id?: number, readData?: TableData): AudioSMPFormProps => ({ 
            mode: formMode, 
            formID: id, 
            readonlyData: readData
        })
    },
    // 1002: {
    //     component: TAMVideoQAForm,
    //     getProps: (formMode: FormMode, id?: number, readData?: TableData): TAMVideoFormProps => ({
    //         mode: formMode, 
    //         formID: id, 
    //         readonlyData: readData
    //     })
    // },
} satisfies Record<keyof Apps, Form<any>>