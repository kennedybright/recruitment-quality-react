import { FC, ReactNode } from "react"
import { ProviderRegistry } from "./providerRegistry"

type DynamicProviderProps = {
    providerName?: string
    children: ReactNode
}

export const DynamicProviderLoader: FC<DynamicProviderProps> = ({ providerName, children }) => {
    const provider = ProviderRegistry[providerName]

    if (!providerName) return <>{children}</>
    if (!provider) throw new Error(`Context Provider [${providerName}] not found in registry.`)

    const props = provider.getProps()
    const ProviderComponent = provider.component

    return <ProviderComponent {...props}>{children}</ProviderComponent>
}