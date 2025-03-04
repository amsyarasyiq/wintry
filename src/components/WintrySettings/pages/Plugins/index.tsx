import PLUGINS from "#wt-plugins";
import { isPluginInternal } from "@plugins/utils";
import AddonPage from "../Addon";
import { createAddonCollectionManager } from "../Addon/AddonCollectionManager";
import type { WintryPluginInstance } from "@plugins/types";
import usePluginStore from "@stores/usePluginStore";
import { showSheet } from "@components/utils/sheets";

const pluginFilterSystem = createAddonCollectionManager({
    data: Object.values(PLUGINS),
    defaultFilterOptions: ["HIDE_INTERNAL"],
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
    ],
});

export default function PluginsPage() {
    return (
        <AddonPage<WintryPluginInstance>
            collectionManager={pluginFilterSystem}
            onPressInfo={plugin => {
                showSheet("PluginSheetComponent", import("./PluginSheetComponent"), { plugin });
            }}
            useCanHandleAddon={id => PLUGINS[id].required !== true}
            useToggler={id => {
                const enabled = usePluginStore(s => s.settings[id].enabled);
                const toggle = usePluginStore(s => s.togglePlugin);

                return [enabled, v => toggle(id, v)];
            }}
        />
    );
}
