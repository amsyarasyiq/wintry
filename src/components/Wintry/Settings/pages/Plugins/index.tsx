import PLUGINS from "#wt-plugins";
import { isPluginInternal } from "@plugins/utils";
import AddonPage from "../Addon";
import { createAddonCollectionManager } from "../Addon/AddonCollectionManager";
import type { WintryPluginInstance } from "@plugins/types";
import usePluginStore from "@stores/usePluginStore";
import { showSheet } from "@components/utils/sheets";

// TODO: since this is top level defined, we can't do i18n here. adapt this to be able to use i18n
const pluginCollectionManager = createAddonCollectionManager({
    data: Object.values(PLUGINS),
    defaultFilterOptions: ["HIDE_INTERNAL", "HIDE_UNAVAILABLE"],
    defaultSortOption: "A-Z",
    sortOptions: [
        {
            key: "A-Z",
            label: "A-Z",
            compareFn: (a, b) => {
                const aInternal = isPluginInternal(a);
                const bInternal = isPluginInternal(b);
                if (aInternal !== bInternal) return aInternal ? 1 : -1;
                return a.name.localeCompare(b.name);
            },
        },
        {
            key: "Z-A",
            label: "Z-A",
            compareFn: (a, b) => {
                const aInternal = isPluginInternal(a);
                const bInternal = isPluginInternal(b);
                if (aInternal !== bInternal) return aInternal ? 1 : -1;
                return b.name.localeCompare(a.name);
            },
        },
    ],
    filterOptions: [
        {
            key: "HIDE_INTERNAL",
            label: "Hide internal plugins",
            filterFn: a => !isPluginInternal(a),
        },
        {
            key: "HIDE_UNAVAILABLE",
            label: "Hide unavailable plugins",
            filterFn: a => a.isAvailable?.() !== false,
        },
    ],
});

export default function PluginsPage() {
    return (
        <AddonPage<WintryPluginInstance>
            collectionManager={pluginCollectionManager}
            onPressInfo={plugin => {
                showSheet("PluginSheetComponent", import("./PluginSheetComponent"), { plugin });
            }}
            useCanHandleAddon={id => PLUGINS[id].$isToggleable()}
            useToggler={id => {
                const enabled = usePluginStore(s => s.settings[id].enabled);
                const toggle = usePluginStore(s => s.togglePlugin);

                return [enabled, v => toggle(id, v)];
            }}
        />
    );
}
