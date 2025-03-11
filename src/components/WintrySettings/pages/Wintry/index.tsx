import { t } from "@i18n";
import { findAssetId } from "@api/assets";
import PageWrapper from "../../PageWrapper";
import { getVersions } from "@debug/info";
import { TableRow, TableRowGroup, TableSwitchRow } from "@components/Discord";
import { View } from "react-native";
import { delay } from "es-toolkit";
import { NavigationNative } from "@metro/common/libraries";
import { lazy } from "react";
import { InfoCard } from "./InfoCard";
import { showSheet } from "@components/utils/sheets";
import { ClientInfoSheet } from "./ClientInfoSheet";
import { showAlert } from "@api/alerts";
import { BundleUpdaterModule } from "@native";
import { openURL } from "@utils/network/url";
import { Links } from "@data/constants";
import { useInitConfigStore } from "@stores/useInitConfigStore";
import { useUpdaterStore } from "@stores/useUpdaterStore";

export default function WintryPage() {
    const navigation = NavigationNative.useNavigation();
    const { config, toggleSafeMode } = useInitConfigStore();
    const updateAvailable = useUpdaterStore(state => state.availableUpdate);
    const { bunny, discord } = getVersions();

    return (
        <PageWrapper scrollable={true} containerStyle={{ paddingTop: 16, gap: 12 }}>
            <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                    <InfoCard
                        title={t.wintry()}
                        tag={updateAvailable ? t.updater.update_tag() : undefined}
                        style={{ flex: 1 }}
                        trailing={`${bunny.version}-${bunny.shortRevision}\n(${bunny.branch})`}
                        icon={<TableRow.Icon source={require("@assets/ic_wintry.png")} />}
                        onPress={() => {
                            navigation.push("WINTRY_CUSTOM_PAGE", {
                                title: t.wintry(),
                                render: lazy(() => import("../Updater")),
                            });
                        }}
                    />
                    <InfoCard
                        title={t.discord()}
                        style={{ flex: 1 }}
                        trailing={`${discord.version}\n(${discord.build})`}
                        icon={<TableRow.Icon source={findAssetId("Discord")} />}
                        onPress={() => showSheet("ClientInfoSheet", ClientInfoSheet)}
                    />
                </View>
            </View>
            <TableRowGroup>
                <TableRow
                    arrow={true}
                    label={t.settings.general.logs()}
                    onPress={() =>
                        navigation.push("WINTRY_CUSTOM_PAGE", {
                            title: t.settings.general.logs(),
                            render: lazy(() => import("../Logs")),
                        })
                    }
                    icon={<TableRow.Icon source={findAssetId("PaperIcon")} />}
                />
            </TableRowGroup>
            <TableRowGroup title={t.settings.general.configurations.label()}>
                <TableSwitchRow
                    label={t.settings.general.configurations.safe_mode.label()}
                    subLabel={t.settings.general.configurations.safe_mode.description()}
                    icon={<TableRow.Icon source={findAssetId("ShieldIcon")} />}
                    value={config.safeMode}
                    onValueChange={v => {
                        const showSafeModeAlert = (enable: boolean) => {
                            const ts = t.settings.general.configurations.safe_mode.alert;
                            const action = enable ? "enable" : "disable";

                            showAlert({
                                id: `safe-mode-${action}`,
                                title: ts.title({ action }),
                                content: ts.description({ action }),
                                actions: [
                                    {
                                        text: ts.apply_and_restart(),
                                        onPress: async () => {
                                            toggleSafeMode(enable);
                                            await delay(500); // Allow time for preferences to be saved
                                            BundleUpdaterModule.reload();
                                        },
                                    },
                                    {
                                        text: ts.apply_without_restart(),
                                        variant: enable ? "primary" : "secondary",
                                        onPress: async () => {
                                            toggleSafeMode(enable);
                                        },
                                    },
                                    {
                                        text: t.actions.nevermind(),
                                        variant: "secondary",
                                        onPress: () => {},
                                    },
                                ],
                            });
                        };

                        showSafeModeAlert(v);
                    }}
                />
            </TableRowGroup>
            <TableRowGroup title={t.settings.general.links()}>
                <TableRow
                    label={t.settings.general.github()}
                    icon={<TableRow.Icon source={findAssetId("img_account_sync_github_light")} />}
                    arrow={true}
                    trailing={<TableRow.TrailingText text={Links.GITHUB} />}
                    onPress={() => openURL(`https://${Links.GITHUB}`)}
                />
                <TableRow
                    label={t.settings.general.discord()}
                    icon={<TableRow.Icon source={findAssetId("Discord")} />}
                    arrow={true}
                    trailing={<TableRow.TrailingText text={Links.DISCORD} />}
                    onPress={() => openURL(`https://${Links.DISCORD}`)}
                />
                <TableRow
                    label={t.settings.general.x()}
                    icon={<TableRow.Icon source={findAssetId("img_account_sync_x_light")} />}
                    arrow={true}
                    trailing={<TableRow.TrailingText text={Links.X} />}
                    onPress={() => openURL(`https://${Links.X}`)}
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
