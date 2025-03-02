import type { ReactNode } from "react";
import type { LiteralUnion, Primitive } from "type-fest";

interface BaseSettingItem {
    type: string;
    title: () => string;
    parent?: string | null | (() => string);
    useDescription?: () => string;
    usePredicate?: () => boolean;
    IconComponent?: React.ComponentType<Record<string, unknown>>;
    unsearchable?: boolean;
    additionalSearchTerms?: () => string[];
}

interface RouteSettingItem extends BaseSettingItem {
    type: "route";
    screen: {
        route: string;
        getComponent: () => React.ComponentType;
        /**
         * Thanks to Discord's wonderful code, we are only able to specify `headerShadowVisible` prop here.
         * To specify other props, you can use useNavigation hook + setOptions method.
         * */
        navigationOptions?: { headerShadowVisible?: boolean };
    };
    useTrailing?: () => ReactNode | string;
    useTrailingDismissibleContent?: () => number;
    /** Return false to manually handle goToScreen */
    preNavigationAction?: (goToScreen: () => void) => boolean;
}

interface PressableSettingItem extends BaseSettingItem {
    type: "pressable";
    onPress: () => void;
    withArrow?: boolean;
    useTrailing?: () => any;
    useIsDisabled?: () => boolean;
    variant?: LiteralUnion<"danger", string>;
}

interface ToggleSettingItem extends BaseSettingItem {
    type: "toggle";
    useValue: () => boolean;
    onValueChange: (value: boolean) => void;
    useIsDisabled?: () => boolean;
}

interface RadioSettingItem extends BaseSettingItem {
    type: "radio";
    useValue: () => any;
    onValueChange: (value: any) => void;
    useOptions: () => {
        label: string;
        value: Primitive;
    }[];
}

interface SliderSettingItem extends BaseSettingItem {
    type: "slider";
    useProps: () => any;
    useTrailing?: () => any;
}

interface VolumeSliderSettingItem extends BaseSettingItem {
    type: "volume_slider";
    maximum: number;
    useValue: () => number;
    onValueChange: (value: number) => void;
}

interface StaticSettingItem extends BaseSettingItem {
    type: "static";
    useTrailing?: () => any;
}

interface CheckboxSettingItem extends BaseSettingItem {
    type: "checkbox";
    useOptions: () => {
        label: string;
        checked: boolean;
        onPress: (currentValue: boolean) => boolean;
    }[];
}

interface GuildSelectorSettingItem extends BaseSettingItem {
    type: "guild_selector";
    useSelectedGuildId: () => string;
    onPress: () => void;
}

export interface SettingSection {
    label: string;
    settings: string[];
    subLabel?: ReactNode | string;
}

export type SettingItem =
    | RouteSettingItem
    | PressableSettingItem
    | ToggleSettingItem
    | RadioSettingItem
    | SliderSettingItem
    | VolumeSliderSettingItem
    | StaticSettingItem
    | CheckboxSettingItem
    | GuildSelectorSettingItem;

export type SettingRendererConfig = Record<string, SettingItem>;

/** @internal */
export const _registeredSettingItems: SettingRendererConfig = {};
/** @internal */
export const _registeredSettingSections: SettingSection[] = [];

export function registerSettingRenderer(name: string, item: SettingItem) {
    _registeredSettingItems[name] = item;
    return name;
}

export function registerSettingSection(section: SettingSection) {
    _registeredSettingSections.push(section);
}
