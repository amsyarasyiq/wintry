import { useShallow } from "zustand/shallow";
import { ActionSheet, Card, ContextMenu, IconButton, Text } from "../../../../metro/common";
import type { WintryPluginInstance } from "../../../../plugins/types";
import usePluginStore from "../../../../stores/usePluginStore";
import { ScrollView, View } from "react-native";
import { findAssetId } from "../../../../metro";
import type { ComponentProps } from "react";
import { hideSheet } from "../../../utils/sheets";
import TitleComponent from "./TitleComponent";
import { t } from "../../../../i18n";

interface PluginSheetComponentProps {
    plugin: WintryPluginInstance;
}

function SheetAwareIconButton(props: ComponentProps<typeof IconButton>) {
    const { onPress } = props;
    props.onPress &&= () => {
        hideSheet("PluginSheetComponent");
        onPress?.();
    };

    return <IconButton {...props} />;
}

export default function PluginSheetComponent({ plugin }: PluginSheetComponentProps) {
    // TODO: Make this a common function
    const settings = usePluginStore(useShallow(state => state.settings[plugin.id]));

    return (
        <ActionSheet>
            <ScrollView contentContainerStyle={{ marginBottom: 12 }}>
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
                                    alert(`${plugin.name} ${settings.enabled ? "Enabled" : "Disabled"}`);
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
                <View>
                    <InfoCard label={t.settings.plugins.description()}>{plugin.description}</InfoCard>
                </View>
            </ScrollView>
        </ActionSheet>
    );
}

function InfoCard({
    label,
    children,
}: {
    label?: string;
    children?: React.ReactNode | string;
}) {
    return (
        <Card>
            <Text variant="text-md/semibold" color="text-secondary" style={{ marginBottom: 8 }}>
                {label}
            </Text>
            {typeof children === "string" ? <Text variant="text-md/medium">{children}</Text> : children}
        </Card>
    );
}
