import { FC } from "react"
import { EditProvider } from "../../modules/edit-forms/base/edit.context"
import { ReportProvider } from "../../modules/generate-report/components/reports"

type Provider<T> = { 
    component: FC<T>, 
    getProps: () => T
}

export const ProviderRegistry = {
    EditProvider: {
        component: EditProvider,
        getProps: () => ({})
    },
    ReportProvider: {
        component: ReportProvider,
        getProps: () => ({})
    },
} satisfies Record<string, Provider<any>>