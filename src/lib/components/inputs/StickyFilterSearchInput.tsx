import TypeheadSearch from '@nielsen-media/maf-fc-typehead-search'
import { InputItemOption } from "@nielsen-media/maf-fc-select"
import { FiltersItems } from "@nielsen-media/maf-fc-sticky-header-filters/dist/types/src/types"

interface TypeaHeadSearchInputProps {
    searchValue: string
    setSearchValue: React.Dispatch<React.SetStateAction<string>>
    items: InputItemOption[]
    label: string
    position: number
    filterItems: FiltersItems[]
    setSelectedFilters: React.Dispatch<React.SetStateAction<FiltersItems[]>>
}

const StickyFilterSearchInput = ({
    searchValue,
    setSearchValue,
    items,
    label,
    position,
    filterItems,
    setSelectedFilters,
}: TypeaHeadSearchInputProps) => {
    const handleFilterItems = (type: number, title: string) => {
        const updatedItems = filterItems.map((element, i) => {
            if (i === type) return { ...element, label: title }
            else return element
        })
        setSelectedFilters(updatedItems)
    }

    return (
        <TypeheadSearch
            items={items}
            label={label}
            placeholder={`Search for ${label}`}
            searchValue={searchValue}
            onInputChange={e => setSearchValue(e.target.value)}
            onItemClick={(_, item) => {
                setSearchValue(item.label)
                handleFilterItems(position, item.label)
            }}
            onClear={() => setSearchValue('')}
            size='compact'
        />
    )
}

export default StickyFilterSearchInput