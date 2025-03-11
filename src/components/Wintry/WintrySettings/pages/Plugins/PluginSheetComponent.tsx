import type { WintryPluginInstance } from "@plugins/types";
import { View } from "react-native";
import { findAssetId } from "@api/assets";
import TitleComponent from "./TitleComponent";
import { t } from "@i18n";
import { RNGHScrollView } from "./common";
import { OptionSection } from "./options/OptionSection";
import { showSheet } from "@components/utils/sheets";
import { PluginDetailsSheet } from "./PluginDetailsSheet";
import { SheetAwareIconButton } from "./SheetAwareIconButton";
import IconButton from "@components/Discord/Button/IconButton";
import BottomSheet from "@components/Discord/Sheet/BottomSheet";
import ContextMenu from "@components/Discord/ContextMenu/ContextMenu";

interface PluginSheetComponentProps {
    plugin: WintryPluginInstance;
}

export default function PluginSheetComponent({ plugin }: PluginSheetComponentProps) {
    return (
        <BottomSheet contentStyles={{ paddingHorizontal: 16 }}>
            <RNGHScrollView contentContainerStyle={{ marginBottom: 24 }}>
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
                {false && (
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
                )}
                <View style={{ gap: 12 }}>
                    <OptionSection plugin={plugin} />
                </View>
            </RNGHScrollView>
        </BottomSheet>
    );
}
