import type { OptionDefinition, WintryPluginInstance } from "@plugins/types";

export interface BaseOptionRowProps<T extends string = string> {
    opt: OptionDefinition & { type: T };
    plugin: WintryPluginInstance;
    settingKey: string;

    start: boolean;
    end: boolean;
}
