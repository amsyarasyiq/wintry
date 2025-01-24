import type { DefinedOptions, OptionDefinitions, WintryPlugin } from "./types";
import { registerPluginSettings, registerPlugin, type LooseWintryPlugin } from "./utils";

interface PluginContextMeta {
    id: string;
}

interface PluginContext {
    definePlugin<
        P extends WintryPlugin<D, O>,
        D extends DefinedOptions<O>,
        O extends OptionDefinitions
    >(plugin: LooseWintryPlugin<P>): P;

    definePluginSettings<Def extends OptionDefinitions>(def: Def): DefinedOptions<Def>;

    meta: PluginContextMeta;
}

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
        }
    }
}