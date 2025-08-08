import SingleSelect, { InputItemOption } from "@nielsen-media/maf-fc-select"
import { FiltersItems } from "@nielsen-media/maf-fc-sticky-header-filters/dist/types/src/types"

interface SingleSelectCompProps {
    label: string
    selectedValue: string
    setSelectedValue: React.Dispatch<React.SetStateAction<string>>
    items: InputItemOption[]
    position: number
    filterItems: FiltersItems[]
    setSelectedFilters: React.Dispatch<React.SetStateAction<FiltersItems[]>>
}

const StickyFilterSingleSelect = ({
    label,
    items,
    selectedValue,
    setSelectedValue,
    position,
    filterItems,
    setSelectedFilters,
}: SingleSelectCompProps) => {
    const handleFilterItems = (type: number, value: string) => {
        const updatedItems = filterItems.map((element, i) => {
            if (i === type) return { ...element, label: value }
            else return element
        })
        setSelectedFilters(updatedItems)
    }

    return (
        <SingleSelect
            items={items}
            label={label}
            placeholder='Choose...'
            selectedValue={selectedValue}
            size='compact'
            onChange={value => {
                handleFilterItems(position, value as string)
                setSelectedValue(value as string)
            }}
        />
    )
}

export default StickyFilterSingleSelect