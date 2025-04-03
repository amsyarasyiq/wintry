import type { WintryTheme } from "@plugins/_core/painter/types";
import AddonPage from "../Addon";
import { createAddonCollectionManager } from "../Addon/AddonCollectionManager";
import { applyTheme, useThemeStore } from "@plugins/_core/painter/useThemeStore";

const themeCollectionManager = createAddonCollectionManager({
    data: () => useThemeStore.getState().themes,
    defaultFilterOptions: [],
    defaultSortOption: "A-Z",
    sortOptions: [
        {
            key: "A-Z",
            label: () => "A-Z",
            compareFn: (a, b) => {
                const meta = a.asAddonMetadata();
                return meta.name.localeCompare(meta.name);
            },
        },
        {
            key: "Z-A",
            label: () => "Z-A",
            compareFn: (a, b) => {
                const meta = a.asAddonMetadata();
                return meta.name.localeCompare(meta.name);
            },
        },
    ],
    filterOptions: [],
});

export default function Themes() {
    return (
        <AddonPage<WintryTheme>
            collectionManager={themeCollectionManager}
            useCanHandleAddon={() => true}
            useToggler={id => {
                const enabled = useThemeStore(s => s.appliedTheme === id);
                return [enabled, () => (enabled ? applyTheme(null, true) : applyTheme(id, true))];
            }}
        />
    );
}
