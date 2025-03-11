import { useShallow } from "zustand/shallow";
import type { OptionDefinition, OptionDefToType } from "@plugins/types";
import usePluginStore from "@stores/usePluginStore";

export function usePluginSettings<O extends OptionDefinition>(id: string, key: string) {
    type RetType = OptionDefToType<O>;
    const current = usePluginStore(useShallow(state => state.settings[id][key])) as RetType;

    const setValue = (value: RetType | ((a: RetType) => RetType)) => {
        usePluginStore.setState(state => {
            state.settings[id][key] = typeof value === "function" ? value(state.settings[id][key]) : value;
        });
    };

    return [current, setValue] as const;
}
