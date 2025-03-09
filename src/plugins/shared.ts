import { wtlogger, type BasicLogger } from "@api/logger";
import type { DefinedOptions, OptionDefinitions, WintryPluginDefinition } from "./types";
import { registerPluginSettings, registerPlugin, type LooseWintryPlugin } from "./utils";

interface PluginContextMeta {
    id: string;
}

interface PluginContext {
    definePlugin<P extends WintryPluginDefinition<D, O>, D extends DefinedOptions<O>, O extends OptionDefinitions>(
        plugin: LooseWintryPlugin<P>,
    ): (...args: any[]) => P;

    definePluginSettings<Def extends OptionDefinitions>(def: Def): DefinedOptions<Def>;

    meta: PluginContextMeta;
    logger: BasicLogger;
}

export const pluginlogger = wtlogger.createChild("Plugins");

export function getPluginContext(id: string): PluginContext {
    // If you added more properties to the context (first level), make sure to update
    // the type definition in src/modules.d.ts and named export in scripts/modules.ts
    return {
        definePlugin(plugin) {
            return registerPlugin(id, plugin);
        },
        definePluginSettings(def) {
            return registerPluginSettings(id, def);
        },
        meta: {
            id,
        },
        logger: pluginlogger.createChild(id),
    };
}
