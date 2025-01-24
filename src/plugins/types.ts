import type { SetRequired } from "type-fest";
import type { Dev } from "../data/constants";

export enum StartAt {
    Init = 0,
    MetroReady = 1,
}

export interface PluginState {
    running: boolean;
    ranPreinit: boolean;
}

export interface PluginSettings {
    enabled: boolean;
    [key: string]: any;
}

export interface WintryPlugin<D extends DefinedOptions<O>, O extends OptionDefinitions> {
    readonly id?: string;
    readonly name: string;
    readonly description: string;
    readonly authors: Dev[];

    readonly required?: boolean;
    readonly preenabled?: boolean;

    readonly settings?: D;

    readonly state?: PluginState;

    /**
     * A check if the plugin can be started/stopped without a restart.
     * If true, the plugin will not load/unload.
     */
    // Probably should have better naming here
    readonly requiresRestart?: (start: boolean, state: PluginState) => boolean;

    /**
     * Called very early, when most APIs are not available and Metro is not ready (you can't forcefully load modules).
     * You can patch modules which are loaded before the index module is initialized here. (e.g. waitFor)
     */
    readonly preinit?: () => void;

    /**
     * This is called once the index module is loaded and you can force lookup modules from here.
     */
    readonly start?: () => void;

    /**
     * Called when the plugin is stopped whether by user action or due to an error.
     * Cleanup any patches you made here IN THE CASE where the patches can be redone without a restart.
     * Otherwise, try to use plugin's state to hide the plugin effects (from the patches).
     */
    readonly cleanup?: () => void;

    /**
     * Called when the plugin is stopped by user action.
     * Return true to manually handle the plugin stop.
     * @param stop Function to stop the plugin
     */
    readonly onStopRequest?: (stop: () => void) => boolean;
}

type RuntimePropertyKey = "id" | "state";

// Allows defining a plugin without the state property and allow extra properties
export type WintryPluginInstance<
    O extends OptionDefinitions = OptionDefinitions,
    D extends DefinedOptions<O> = DefinedOptions<O>,
> = SetRequired<WintryPlugin<D, O>, RuntimePropertyKey>;

export type OptionDefinitions = Record<string, OptionDefinition>;
export type OptionDefinition =
    | StringOptionDefinition
    | BooleanOptionDefinition
    | SelectOptionDefinition
    | RadioOptionDefinition
    | SliderOptionDefinition
    | SelectOptionDefinition;

export type OptionDefToType<T extends OptionDefinition> = T extends StringOptionDefinition
    ? string
    : T extends BooleanOptionDefinition
    ? boolean
    : T extends RadioOptionDefinition
    ? T["options"][number]["value"]
    : T extends SelectOptionDefinition
    ? T["options"][number]["value"][]
    : T extends SliderOptionDefinition
    ? (string | number)
    : never;

type OptionDefaultType<O extends OptionDefinition> = O extends RadioOptionDefinition | SelectOptionDefinition
    ? O["options"] extends { default?: boolean }[]
    ? O["options"][number]["value"]
    : undefined
    : O extends { default: infer T }
    ? T
    : undefined;

export type SettingsStore<D extends OptionDefinitions> = {
    [K in keyof D]: OptionDefToType<D[K]> | OptionDefaultType<D[K]>;
};

export interface DefinedOptions<Def extends OptionDefinitions> {
    pluginId: string;
    definition: Def;
    get: () => SettingsStore<Def>;
    use: <T>(selector: (state: SettingsStore<Def>) => T) => T;
}

type OptionType = "string" | "boolean" | "select" | "radio" | "slider";

interface OptionDefinitionBase {
    type: OptionType;
    label: string;
    description?: string;
    icon?: string | { uri: string };
}

interface StringOptionDefinition extends OptionDefinitionBase {
    type: "string";
    placeholder?: string;
    default?: string;
    textArea?: boolean;
    validate?: (value: string) => boolean;
}

interface BooleanOptionDefinition extends OptionDefinitionBase {
    type: "boolean";
    default?: boolean;
}

interface SelectOptionDefinition extends OptionDefinitionBase {
    type: "select";
    options: SelectRadioOptionRow[];
}

interface RadioOptionDefinition extends OptionDefinitionBase {
    type: "radio";
    options: SelectRadioOptionRow[];
}

interface SliderOptionDefinition extends OptionDefinitionBase {
    type: "slider";
    points: (string | number)[];
    default?: string | number;
}

interface SelectRadioOptionRow {
    label: string;
    description?: string;
    icon?: string | { uri: string };
    value: string | number | boolean;
    default?: boolean;
}
