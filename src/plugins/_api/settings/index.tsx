import { definePlugin, definePluginSettings, logger, meta } from "#plugin-context";
import {
    _registeredSettingItems,
    _registeredSettingSections,
    registerSettingRenderer,
    registerSettingSection,
    type SettingRendererConfig,
} from "@api/settings";
import { TableRow } from "@components/Discord";
import Tag from "@components/Wintry/Tag";
import { Devs } from "@data/constants";
import { getVersions } from "@debug/info";
import { t } from "@i18n";
import { lookup } from "@metro";
import { byName, byProps } from "@metro/common/filters";
import { PuzzlePieceIcon, WrenchIcon } from "@metro/common/icons";
import { NavigationNative } from "@metro/common/libraries";
import { waitFor } from "@metro/internal/modules";
import { createContextualPatcher } from "@patcher/contextual";
import { useUpdaterStore } from "@stores/useUpdaterStore";
import { findInReactTree } from "@utils/objects";
import { memoize } from "es-toolkit";
import { lazy, memo, useLayoutEffect } from "react";

const SettingsOverviewScreen = lookup(byName("SettingsOverviewScreen", { returnEsmDefault: false })).asLazy();
const patcher = createContextualPatcher({ pluginId: meta.id });

const settings = definePluginSettings({
    onTop: {
        label: "Put on top",
        description: "Put the settings on top of the settings list",
        type: "boolean",
        default: false,
    },
});

export default definePlugin({
    name: "Settings",
    description: "Provides a settings interface and debug information",
    authors: [Devs.Pylix],
    required: true,

    start() {
        waitFor(byProps(["SETTING_RENDERER_CONFIG"]), SettingConstants => {
            const origRendererConfig = SettingConstants.SETTING_RENDERER_CONFIG as SettingRendererConfig;

            Object.defineProperty(SettingConstants, "SETTING_RENDERER_CONFIG", {
                enumerable: true,
                configurable: true,
                get: () => ({
                    ...origRendererConfig,
                    ..._registeredSettingItems,
                }),
                set: value => {
                    Object.defineProperty(SettingConstants, "SETTING_RENDERER_CONFIG", {
                        writable: true,
                        value,
                    });
                },
            });

            patcher.addDisposer(() => {
                SettingConstants.SETTING_RENDERER_CONFIG = origRendererConfig;
            });
        });

        patcher.after(SettingsOverviewScreen, "default", (_, ret) => {
            const { props } = findInReactTree(ret, i => i.props?.sections);
            if (!props) {
                logger.warn("Failed to find settings sections in SettingsOverviewScreen");
                return;
            }

            if (!settings.get().onTop) {
                try {
                    const accountSectionIndex = props.sections.findIndex((i: any) => i.settings.includes("ACCOUNT"));
                    if (accountSectionIndex !== -1) {
                        props.sections = [
                            ...props.sections.slice(0, accountSectionIndex + 1),
                            ..._registeredSettingSections,
                            ...props.sections.slice(accountSectionIndex + 1),
                        ];
                        return;
                    }
                } catch (e) {
                    logger.warn`Failed to insert settings sections next to account section: ${e}`;
                }
            }

            props.sections = [..._registeredSettingSections, ...props.sections];
        });

        setImmediate(() => {
            // Hack that allows pushing custom pages without having to register the setting renderer
            // by passing the component through the route params
            registerSettingRenderer("WINTRY_CUSTOM_PAGE", {
                type: "route",
                title: () => "",
                unsearchable: true,
                screen: {
                    route: "WINTRY_CUSTOM_PAGE",
                    getComponent: memoize(() =>
                        memo(() => {
                            const navigation = NavigationNative.useNavigation();
                            const route = NavigationNative.useRoute();

                            const { render: PageComponent, ...args } = route.params;

                            // biome-ignore lint/correctness/useExhaustiveDependencies: This is fine
                            useLayoutEffect(() => void navigation.setOptions({ ...args }), [navigation]);

                            // TODO: Wrap with ErrorBoundary
                            return <PageComponent />;
                        }),
                    ),
                },
            });

            registerSettingSection({
                label: t.wintry(),
                settings: [
                    registerSettingRenderer("WINTRY", {
                        type: "route",
                        title: () => t.wintry(),
                        IconComponent: () => <TableRow.Icon source={require("@assets/ic_wintry.png")} />,
                        useTrailing: () => {
                            const availableUpdate = useUpdaterStore(s => s.availableUpdate);
                            if (availableUpdate) return <Tag text={t.updater.update_tag()} />;

                            const { version, shortRevision, branch } = getVersions().bunny;
                            return `${version}-${shortRevision} (${branch})`;
                        },
                        screen: {
                            route: "WINTRY",
                            getComponent: () => lazy(() => import("@components/Wintry/Settings/pages/Wintry")),
                        },
                    }),
                    registerSettingRenderer("WINTRY_PLUGINS", {
                        type: "route",
                        title: () => t.settings.sections.plugins(),
                        IconComponent: PuzzlePieceIcon,
                        screen: {
                            route: "WINTRY_PLUGINS",
                            getComponent: () => lazy(() => import("@components/Wintry/Settings/pages/Plugins")),
                        },
                    }),
                    registerSettingRenderer("WINTRY_DEVELOPER", {
                        type: "route",
                        title: () => t.settings.sections.developer(),
                        IconComponent: WrenchIcon,
                        screen: {
                            route: "WINTRY_DEVELOPER",
                            getComponent: () => lazy(() => import("@components/Wintry/Settings/pages/Developer")),
                        },
                    }),
                    // registerSettingRenderer("WINTRY_UPDATER", {
                    //     type: "route",
                    //     title: () => t.settings.sections.updater(),
                    //     IconComponent: DownloadIcon,
                    //     screen: {
                    //         route: "WINTRY_UPDATER",
                    //         getComponent: () => lazy(() => import("@components/WintrySettings/pages/Updater")),
                    //     },
                    // }),
                ],
            });
        });
    },
});
