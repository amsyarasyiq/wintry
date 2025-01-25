import { TableSwitchRow } from "@metro/common";
import { usePluginSettings } from "../common/usePluginSettings";
import type { BaseOptionRowProps } from "./BaseOptionRowProps";
import { getIcon } from "../common/getIcon";

export function BooleanOptionRow({ opt, plugin, settingKey }: BaseOptionRowProps<"boolean">) {
    const [current, setCurrent] = usePluginSettings<typeof opt>(plugin.id, settingKey);

    return (
        <TableSwitchRow
            label={opt.label}
            subLabel={opt.description}
            icon={getIcon(opt.icon)}
            value={current}
            onValueChange={() => setCurrent(v => !v)}
        />
    );
}
