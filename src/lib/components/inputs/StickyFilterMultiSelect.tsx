import { InputItemOption, MultiSelect } from "@nielsen-media/maf-fc-select"
import { FiltersItems } from "@nielsen-media/maf-fc-sticky-header-filters/dist/types/src/types"
import Chip from '@nielsen-media/maf-fc-info-chip'

interface MultiSelectCompProps {
    label: string
    selectedValue: string[]
    setSelectedValue: React.Dispatch<React.SetStateAction<string[]>>
    items: InputItemOption[]
    position: number
    filterItems: FiltersItems[]
    setSelectedFilters: React.Dispatch<React.SetStateAction<FiltersItems[]>>
}

const StickyFilterMultiSelect = ({
    label,
    items,
    selectedValue,
    setSelectedValue,
    position,
    filterItems,
    setSelectedFilters,
}: MultiSelectCompProps) => {
    const handleFilterItems = (type: number, value: string[]) => {
        const updatedItems = filterItems.map((element, i) => {
            if (i === type) return {
                ...element,
                label:
                    value.length === items.length
                    ? 'All'
                    : value
                        .map(element => {
                            const res = items.find(item => item.value === element)
                            return res?.label
                        }).join(', '),
                chip: { label: value.length.toString(), variant: Chip.Variant.neutral },
            }
            else return element
        })
        setSelectedFilters(updatedItems)
    }

    return (
        <MultiSelect
            hasCountLabel
            items={items}
            label={label}
            placeholder='Choose...'
            selectedValues={selectedValue}
            size='compact'
            onChange={value => {
                handleFilterItems(position, value as string[])
                setSelectedValue(value as string[])
            }}
        />
    )
}

export default StickyFilterMultiSelect