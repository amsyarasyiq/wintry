import { t } from "@i18n";
import { findAssetId } from "@api/assets";
import PageWrapper from "../../PageWrapper";
import { getVersions } from "@debug/info";
import { Card, TableRow, TableRowGroup, TableSwitchRow, Text } from "@components/Discord";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { noop } from "es-toolkit";
import usePrefsStore from "@stores/usePrefsStore";

interface InfoCardProps {
    icon?: React.ReactElement;
    title: string;
    style?: StyleProp<ViewStyle>;
    trailing: React.ReactElement | string;
    onPress: () => void;
}

function InfoCard({ title, style, icon, onPress, trailing }: InfoCardProps) {
    return (
        <Card style={style} onPress={onPress}>
            <View style={{ gap: 8 }}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {icon}
                    <Text numberOfLines={2} style={{ textAlign: "right" }} variant="text-sm/medium" color="text-muted">
                        {trailing}
                    </Text>
                </View>
                <Text variant="heading-md/semibold">{title}</Text>
            </View>
        </Card>
    );
}

export default function WintryPage() {
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
                        onPress={noop}
                    />
                    <InfoCard
                        title={t.discord()}
                        style={{ flex: 1 }}
                        trailing={`${discord.version}\n(${discord.build})`}
                        icon={<TableRow.Icon source={findAssetId("Discord")} />}
                        onPress={noop}
                    />
                </View>
            </View>
            <TableRowGroup>
                <TableRow
                    arrow={true}
                    label={t.settings.general.logs()}
                    onPress={noop}
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
