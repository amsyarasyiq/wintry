import { t } from "@i18n";
import { findAssetId } from "@api/assets";
import PageWrapper from "../../PageWrapper";
import { getVersions } from "@debug/info";
import { TableRow, TableRowGroup, TableSwitchRow } from "@components/Discord";
import { View } from "react-native";
import { noop } from "es-toolkit";
import usePrefsStore from "@stores/usePrefsStore";
import { NavigationNative } from "@metro/common/libraries";
import { lazy } from "react";
import { InfoCard } from "./InfoCard";
import { showSheet } from "@components/utils/sheets";
import { ClientInfoSheet } from "./ClientInfoSheet";

export default function WintryPage() {
    const navigation = NavigationNative.useNavigation();
    const { safeMode } = usePrefsStore();
    const { bunny, discord } = getVersions();

    return (
        <PageWrapper style={{ paddingTop: 16, gap: 12 }}>
            <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                    <InfoCard
                        title={t.wintry()}
                        style={{ flex: 1 }}
                        trailing={`${bunny.shortRevision}\n(${bunny.branch})`}
                        icon={<TableRow.Icon source={require("@assets/wintry.png")} />}
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
                            render: lazy(() => import("./Logs")),
                        })
                    }
                    icon={<TableRow.Icon source={findAssetId("PaperIcon")} />}
                />
            </TableRowGroup>
            <TableRowGroup title={t.settings.general.configurations.label()}>
                <TableSwitchRow
                    label={t.settings.general.configurations.enable_safe_mode()}
                    subLabel={t.settings.general.configurations.enable_safe_mode_description()}
                    icon={<TableRow.Icon source={findAssetId("ShieldIcon")} />}
                    value={safeMode}
                    onValueChange={noop}
                />
            </TableRowGroup>
            <TableRowGroup title={t.settings.general.links()}>
                <TableRow
                    label={t.settings.general.github()}
                    icon={<TableRow.Icon source={findAssetId("img_account_sync_github_light")} />}
                    arrow={true}
                    trailing={<TableRow.TrailingText text="github.com/wintry-mod" />}
                    onPress={noop}
                />
                <TableRow
                    label={t.settings.general.discord()}
                    icon={<TableRow.Icon source={findAssetId("Discord")} />}
                    arrow={true}
                    trailing={<TableRow.TrailingText text="discord.gg/xxxxx" />}
                    onPress={noop}
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
