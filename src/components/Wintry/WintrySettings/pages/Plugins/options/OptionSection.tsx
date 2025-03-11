import { t } from "@i18n";
import type { OptionDefinition, WintryPluginInstance } from "@plugins/types";
import { getPluginSettings } from "@plugins/utils";
import { InfoSection } from "../../InfoSection";
import { View } from "react-native";
import { OptionDefRow } from "./OptionDefRow";

function getGroupedOptions(plugin: WintryPluginInstance) {
    const options = Object.entries(getPluginSettings(plugin.$id) || {});

    const groupableMap = [["string", "boolean", "slider"]];
    const groupable = groupableMap.flat();
    const groupedOptions: [string, OptionDefinition][][] = [];

    for (const [key, opt] of options) {
        let currentGroup = groupedOptions[groupedOptions.length - 1];
        if (!currentGroup || !groupable.includes(opt.type) || groupableMap.some(group => !group.includes(opt.type))) {
            currentGroup = [];
            groupedOptions.push(currentGroup);
        }

        currentGroup.push([key, opt]);
    }

    return groupedOptions;
}

export function OptionSection({ plugin }: { plugin: WintryPluginInstance }) {
    const options = getGroupedOptions(plugin);
    if (options.length === 0) return null;

    return (
        <InfoSection label={t.settings.plugins.info_sheet.configurations()}>
            <View style={{ gap: 12 }}>
                {options.map((group, i) => (
                    <View key={i}>
                        {group.map(([key, opt], i) => (
                            <View key={key}>
                                <OptionDefRow
                                    opt={opt}
                                    plugin={plugin}
                                    settingKey={key}
                                    start={i === 0}
                                    end={i === group.length - 1}
                                />
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </InfoSection>
    );
}
