import { createContextualPatcher } from "../../../patcher/contextual";
import { NavigationNative, React } from "../../../metro/common";
import { findByName, findByProps } from "../../../metro/api";
import { waitFor } from "../../../metro/internal/modules";
import { byProps } from "../../../metro/filters";
import { findInReactTree } from "../../../utils/objects";

import { TableRow } from "../../../metro/common/components";

import WintryIcon from "./wintry.png";
import { definePlugin } from "../../types";
import type { ComponentProps } from "react";
import type { Text } from "react-native";
import { findAssetId } from "../../../metro/assets";

const patcher = createContextualPatcher({ pluginName: "Settings" });

const SettingsOverviewScreen = findByName("SettingsOverviewScreen", false);
const tabsNavigationRef = findByProps("getRootNavigationRef");

const CustomPageRenderer = () => {
    const navigation = NavigationNative.useNavigation();
    const route = NavigationNative.useRoute();

    const { render: PageComponent, ...args } = route.params;

    React.useEffect(() => void navigation.setOptions({ ...args }), [navigation]);

    // TODO: Wrap with ErrorBoundary
    return <PageComponent />;
};

interface SettingRowConfig {
    key: string;
    title: () => string;
    onPress?: () => any;
    render?: Parameters<typeof React.lazy>[0];
    IconComponent?: React.ComponentType;
    usePredicate?: () => boolean;
    useTrailing?: () => ComponentProps<typeof Text>["children"];
    rawTabsConfig?: Record<string, any>;
}

export default definePlugin("settings", {
    name: "Settings",
    description: "Adds Settings UI and debug info",
    authors: [{ name: "pylixonly" }],
    required: true,

    start() {
        patcher.addDisposer(
            this.registerSection({
                name: "Wintry",
                items: [
                    {
                        key: "WINTRY",
                        title: () => "Wintry",
                        IconComponent: () => <TableRow.Icon source={{ uri: WintryIcon }} />,
                        render: () => import("./components/pages/Wintry"),
                    },
                    {
                        key: "WINTRY_PLUGINS",
                        title: () => "Plugins",
                        IconComponent: () => <TableRow.Icon source={findAssetId("ActivitiesIcon")} />,
                        render: () => import("./components/pages/Plugins"),
                    },
                ],
            }),

            waitFor(byProps("SETTING_RENDERER_CONFIG"), settingConstants => {
                const origRendererConfig = settingConstants.SETTING_RENDERER_CONFIG;
                let rendererConfigValue = settingConstants.SETTING_RENDERER_CONFIG;

                Object.defineProperty(settingConstants, "SETTING_RENDERER_CONFIG", {
                    enumerable: true,
                    configurable: true,
                    get: () => ({
                        ...rendererConfigValue,

                        // Render "custom" Bunny page
                        BUNNY_CUSTOM_PAGE: {
                            type: "route",
                            title: () => "Bunny",
                            screen: {
                                route: "BUNNY_CUSTOM_PAGE",
                                getComponent: () => CustomPageRenderer,
                            },
                        },

                        // Render other sections
                        ...this.getRowConfigs(),
                    }),
                    set: v => (rendererConfigValue = v),
                });

                patcher.addDisposer(() => {
                    Object.defineProperty(settingConstants, "SETTING_RENDERER_CONFIG", {
                        value: origRendererConfig,
                        writable: true,
                        get: undefined,
                        set: undefined,
                    });
                });
            }),

            patcher.after(SettingsOverviewScreen, "default", (_, ret) => {
                const { sections } = findInReactTree(ret, i => i.props?.sections).props;
                let index = -~sections.findIndex((sect: any) => sect.settings.includes("ACCOUNT")) || 1;

                for (const sect in this.registeredSections) {
                    sections.splice(index++, 0, {
                        label: sect,
                        title: sect,
                        settings: this.registeredSections[sect].map(a => a.key),
                    });
                }
            }),
        );
    },

    cleanup() {
        patcher.dispose();
    },

    registeredSections: {} as Record<string, SettingRowConfig[]>,

    registerSection(section: { name: string; items: SettingRowConfig[] }) {
        this.registeredSections[section.name] = section.items;
        return () => delete this.registeredSections[section.name];
    },

    getRowConfigs() {
        const rows: Record<string, any> = {};

        for (const sect in this.registeredSections) {
            for (const row of this.registeredSections[sect]) {
                rows[row.key] = {
                    type: "pressable",
                    title: row.title,
                    IconComponent: row.IconComponent,
                    usePredicate: row.usePredicate,
                    useTrailing: row.useTrailing,
                    onPress: () => {
                        if (row.onPress) return row.onPress();

                        const Component = React.lazy(row.render!);
                        tabsNavigationRef.getRootNavigationRef().navigate("BUNNY_CUSTOM_PAGE", {
                            title: row.title(),
                            render: () => <Component />,
                        });
                    },
                    withArrow: true,
                    ...row.rawTabsConfig,
                };
            }
        }

        return rows;
    },
});
