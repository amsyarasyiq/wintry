import { View } from "react-native";
import { t } from "../../../../../i18n";
import type { WintryPluginInstance } from "../../../../../plugins/types";
import { getPluginSettings } from "../../../../../plugins/utils";
import { InfoCard } from "../PluginSheetComponent";
import { OptionDefRow } from "./OptionDefRow";

export function OptionSection({ plugin }: { plugin: WintryPluginInstance }) {
    const options = getPluginSettings(plugin.id);
    if (!options) return null;

    return (
        <InfoCard label={t.settings.plugins.info_sheet.configurations()}>
            {/* TODO: There have to be a better way to do this */}
            <View style={{ borderWidth: 0.9, borderColor: "rgba(0, 0, 0, 0.3)", borderRadius: 12, overflow: "hidden" }}>
                {Object.entries(options).map(([key, def], i) => {
                    return <OptionDefRow key={i} settingKey={key} opt={def} plugin={plugin} />;
                })}
            </View>
        </InfoCard>
    );
}
