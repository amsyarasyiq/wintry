import { TableSwitchRow } from "@components/Discord";
import { usePluginSettings } from "../common/usePluginSettings";
import type { BaseOptionRowProps } from "./BaseOptionRowProps";
import { getIcon } from "../common/getIcon";

export function BooleanOptionRow({ opt, plugin, settingKey, start, end }: BaseOptionRowProps<"boolean">) {
    const [current, setCurrent] = usePluginSettings<typeof opt>(plugin.$id, settingKey);

    return (
        <TableSwitchRow
            start={start}
            end={end}
            label={opt.label}
            subLabel={opt.description}
            icon={getIcon(opt.icon)}
            value={current}
            onValueChange={() => setCurrent(v => !v)}
        />
    );
}
