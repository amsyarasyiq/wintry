import { findAssetId } from "@api/assets";
import { IconButton } from "@components/Discord";
import ContextMenu from "@components/Discord/ContextMenu/ContextMenu";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Search, { type useSearchQuery } from "./Search";

export interface SortOption<T, K extends string> {
    key: K;
    label: () => string;
    compareFn: (a: T, b: T) => number;
}

export interface FilterOption<T, K extends string> {
    key: K;
    label: () => string;
    filterFn: (item: T) => boolean;
}

export interface FilterAndSortBarProps<T, SK extends string, FK extends string> {
    queryRef: ReturnType<typeof useSearchQuery>;
    sortOptions: SortOption<T, SK>[];
    filterOptions: FilterOption<T, FK>[];
    onSortChange: (sortOption: SK) => void;
    onFilterChange: (filterOption: FK) => void;
    currentFilterOptions: string[];
    currentSortOption: string;
    style?: StyleProp<ViewStyle>;
}

export function FilterAndSortBar<T, SK extends string, FK extends string>({
    queryRef,
    sortOptions,
    filterOptions,
    onSortChange,
    onFilterChange,
    currentFilterOptions,
    currentSortOption,
    style,
}: FilterAndSortBarProps<T, SK, FK>) {
    return (
        <View style={[{ flexDirection: "row", gap: 8 }, style]}>
            <Search style={{ flexGrow: 1 }} isRound={true} queryRef={queryRef} />

            {sortOptions.length > 0 && (
                <ContextMenu
                    items={sortOptions.map(option => ({
                        label: option.label(),
                        iconSource:
                            currentSortOption === option.key ? findAssetId("CheckmarkSmallBoldIcon") : undefined,
                        action: () => onSortChange(option.key),
                    }))}
                >
                    {props => <IconButton {...props} variant="tertiary" icon={findAssetId("ArrowsUpDownIcon")} />}
                </ContextMenu>
            )}

            {filterOptions.length > 0 && (
                <ContextMenu
                    items={filterOptions.map(option => ({
                        label: option.label(),
                        iconSource: currentFilterOptions.includes(option.key)
                            ? findAssetId("CheckmarkSmallBoldIcon")
                            : undefined,
                        action: () => onFilterChange(option.key),
                    }))}
                >
                    {props => <IconButton {...props} variant="tertiary" icon={findAssetId("FiltersHorizontalIcon")} />}
                </ContextMenu>
            )}
        </View>
    );
}
