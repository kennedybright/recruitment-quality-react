import { useMemo } from "react"
import { ColumnDef, MAFColumnExtensions, TableData } from '@nielsen-media/maf-fc-table2'

export type MakeTableConfig<T> = {
    initData: T[]
    extensions?: MAFColumnExtensions
    columnProps?: {id: string, props: Partial<ColumnDef<T>>}[]
}

// Custom hook function to format table data for Table2 component
export function useMakeData<T extends Record<string, any>>(initData:T[]): TableData[] {
    return initData.map((item, index) => ({ id: index+1, ...item }))
}

// Custom hook function to format table data for Table2 component
export function useMakeColumns<T extends Record<string, any>>(initData:T[], extensions?:MAFColumnExtensions, columnProps?:{id: string, props: Partial<ColumnDef<T>>}[]): ColumnDef<TableData>[] {
    return Object.keys(initData[0]).map((key) => {
        if (columnProps) {
            const colProps = columnProps.find(props => props.id === key)?.props
            const column: ColumnDef<TableData> = {
                id: key,
                header: key.replaceAll(/_/g, " ").toUpperCase(), // Format column header text
                accessorKey: key,
                meta: { extensions: extensions, ...colProps.meta },
                ...colProps
            }
            return column
        }
        
        const column: ColumnDef<TableData> = {
            header: key.replaceAll(/_/g, " ").toUpperCase(), // Format column header text
            accessorKey: key,
            meta: { extensions: extensions }
        }
        return column
    })
}

// Custom hook function to generate table data and columns (properties for Table2 component)
export function useMakeTable<T extends Record<string, any>>({initData, extensions, columnProps}: MakeTableConfig<T>) {
    if (initData.length === 0) { return { data: [], columns: [] } }
    else {
        // create "id" property for each data record
        const data = useMakeData(initData)
        const columns = useMemo(() => { return useMakeColumns(initData, extensions, columnProps)}, [])
        return { data, columns }
    }
}