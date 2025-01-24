import { ActionSheet, Card, ContextMenu, IconButton, Text } from "../../../../metro/common";
import type { WintryPluginInstance } from "../../../../plugins/types";
import { View } from "react-native";
import { findAssetId } from "../../../../metro";
import type React from "react";
import TitleComponent from "./TitleComponent";
import { t } from "../../../../i18n";
import { RNGHScrollView } from "./common";
import { SheetAwareIconButton } from "./SheetAwareIconButton";
import { OptionSection } from "./options/OptionSection";
import { showSheet } from "../../../utils/sheets";
import { PluginDetailsSheet } from "./PluginDetailsSheet";

interface PluginSheetComponentProps {
    plugin: WintryPluginInstance;
}

export default function PluginSheetComponent({ plugin }: PluginSheetComponentProps) {
    return (
        <ActionSheet>
            <RNGHScrollView contentContainerStyle={{ marginBottom: 12 }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingVertical: 24,
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <TitleComponent plugin={plugin} />
                    <ContextMenu
                        items={[
                            {
                                label: t.settings.plugins.info_sheet.details(),
                                iconSource: findAssetId("CircleInformationIcon-primary"),
                                action: () => {
                                    showSheet("PluginDetailsSheet", PluginDetailsSheet, { plugin }, "stack");
                                },
                            },
                        ]}
                    >
                        {props => (
                            <IconButton
                                {...props}
                                icon={findAssetId("MoreHorizontalIcon")}
                                variant="secondary"
                                size="sm"
                            />
                        )}
                    </ContextMenu>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        alignContent: "center",
                        marginBottom: 12,
                    }}
                >
                    <SheetAwareIconButton
                        label={t.settings.plugins.info_sheet.view_source()}
                        variant="secondary"
                        disabled={true} // Disabled until the plugin info page is implemented (if ever)
                        icon={findAssetId("img_account_sync_github_white")}
                        onPress={() => {}}
                    />
                    <SheetAwareIconButton
                        label={t.settings.plugins.info_sheet.more_info()}
                        variant="secondary"
                        disabled={true}
                        icon={findAssetId("LinkExternalSmallIcon")}
                        onPress={() => {}}
                    />
                </View>
                <View style={{ gap: 12 }}>
                    <InfoCard label={t.settings.plugins.description()}>{plugin.description}</InfoCard>
                    <OptionSection plugin={plugin} />
                </View>
            </RNGHScrollView>
        </ActionSheet>
    );
}

export function InfoCard({
    label,
    children,
}: {
    label?: string;
    children?: React.ReactNode | string;
}) {
    return (
        <Card spacing={{ padding: 0 }}>
            <Text variant="heading-sm/semibold" color="text-secondary" style={{ marginBottom: 8 }}>
                {label}
            </Text>
            {typeof children === "string" ? <Text variant="text-md/medium">{children}</Text> : children}
        </Card>
    );
}
