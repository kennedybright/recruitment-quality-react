import { FilterItem, FilterOperator } from "@nielsen-media/maf-fc-adjustment-bar"
import { PartialPickerDate } from "@nielsen-media/maf-fc-date-picker"

export const matchesFilters = <T,>(item: T, filters: FilterItem[], operator: FilterOperator): boolean => {
    const filterCheck = ({ fieldId, value }: FilterItem) => {
        const fieldValue = `${item[fieldId as keyof T] ?? ''}`.toLowerCase()
        return fieldValue.includes(value.toLowerCase())
    }

    if (!filters) return true
    return operator === FilterOperator.OR
        ? filters.some(filterCheck)
        : filters.every(filterCheck)
}

export const matchesDateRange = <T,>(item: T, dates: [PartialPickerDate, PartialPickerDate]): boolean => {
    if (!dates) return true 
    const dateRange = [new Date(dates[0]), new Date(dates[1])]
    return (
      new Date(item["record_date"]) > dateRange[0] 
      && new Date(item["record_date"]) < dateRange[1]
    )
  }