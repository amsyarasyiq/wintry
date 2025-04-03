import fuzzysort from "fuzzysort";
import { useSearchQuery } from "../../../../Wintry/Search";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { type SortOption, type FilterOption, FilterAndSortBar } from "../../../FilterAndSortBar";
import type { Addon } from ".";

type FilterAndSortStore<SK extends string, FK extends string> = {
    currentQuery: string;
    currentSortOption: SK;
    currentFilterOptions: FK[];

    setSortOption: (option: SK) => void;
    toggleFilterOption: (option: FK) => void;
};

export interface AddonCollectionManager<T extends Addon, SK extends string = string, FK extends string = string> {
    useFilterAndSortStore: UseBoundStore<StoreApi<FilterAndSortStore<SK, FK>>>;
    useFilterResults: () => Fuzzysort.KeysResult<T>[];
    searchTerms: Array<(v: T) => string>;
    FilterBarComponent: () => JSX.Element;
}

export type AddonCollectionManagerBuilderProps<T extends Addon, SK extends string, FK extends string> = {
    data: () => T[];
    defaultSortOption: SK;
    defaultFilterOptions: FK[];
    sortOptions: SortOption<T, SK>[];
    filterOptions: FilterOption<T, FK>[];
    searchTerms?: Array<(v: T) => string>;
};

export function createAddonCollectionManager<T extends Addon, SK extends string, FK extends string>({
    data,
    defaultSortOption,
    defaultFilterOptions,
    sortOptions,
    filterOptions,
    ...props
}: AddonCollectionManagerBuilderProps<T, SK, FK>): AddonCollectionManager<T, SK, FK> {
    const searchTerms: ((a: T) => string)[] = [
        v => v.asAddonMetadata().name,
        v => v.asAddonMetadata().description,
        v =>
            v
                .asAddonMetadata()
                .authors.map(a => a.name)
                .join(", "),
        ...(props.searchTerms ?? []),
    ];

    const useStore = create<FilterAndSortStore<SK, FK>>(set => ({
        currentQuery: "",
        currentSortOption: defaultSortOption,
        currentFilterOptions: defaultFilterOptions,

        setSortOption: (option: SK) => set({ currentSortOption: option }),
        toggleFilterOption: (option: FK) =>
            set(state => {
                if (state.currentFilterOptions.includes(option)) {
                    return { currentFilterOptions: state.currentFilterOptions.filter(o => o !== option) };
                }

                return { currentFilterOptions: [...state.currentFilterOptions, option] };
            }),
    }));

    return {
        useFilterAndSortStore: useStore,
        searchTerms: searchTerms,
        useFilterResults: () => {
            const { currentSortOption, currentFilterOptions, currentQuery } = useStore();

            let addons = data();
            for (const option of currentFilterOptions) {
                const filterFn = filterOptions.find(o => o.key === option)?.filterFn;
                if (filterFn) {
                    addons = addons.filter(filterFn);
                }
            }

            const result = fuzzysort.go(currentQuery, addons, {
                keys: searchTerms,
                all: true,
            });

            return [...result].sort(
                (a, b) => sortOptions.find(o => o.key === currentSortOption)?.compareFn(a.obj, b.obj) ?? 0,
            );
        },
        FilterBarComponent: () => {
            const queryRef = useSearchQuery();
            if (useStore.getState().currentQuery !== queryRef.query) {
                useStore.setState({ currentQuery: queryRef.query });
            }

            return (
                <FilterAndSortBar
                    queryRef={queryRef}
                    sortOptions={sortOptions}
                    filterOptions={filterOptions}
                    currentSortOption={useStore(state => state.currentSortOption)}
                    currentFilterOptions={useStore(state => state.currentFilterOptions)}
                    onSortChange={useStore(state => state.setSortOption)}
                    onFilterChange={useStore(state => state.toggleFilterOption)}
                />
            );
        },
    };
}
