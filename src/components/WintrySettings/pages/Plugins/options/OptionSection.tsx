import { t } from "../../../../../i18n";
import { TableRowGroup } from "../../../../../metro/common";
import type { WintryPluginInstance } from "../../../../../plugins/types";
import { getPluginSettings } from "../../../../../plugins/utils";
import { InfoCard } from "../PluginSheetComponent";
import { OptionDefRow } from "./OptionDefRow";

export function OptionSection({ plugin }: { plugin: WintryPluginInstance }) {
    const options = getPluginSettings(plugin.id);
    if (!options) return null;

    return (
        <InfoCard label={t.settings.plugins.info_sheet.configurations()}>
            <TableRowGroup>
                {Object.entries(options).map(([key, def], i) => {
                    return <OptionDefRow key={i} settingKey={key} opt={def} plugin={plugin} />;
                })}
            </TableRowGroup>
        </InfoCard>
    );
}
