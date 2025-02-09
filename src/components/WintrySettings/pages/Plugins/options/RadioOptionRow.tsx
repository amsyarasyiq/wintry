import { RedesignCompat } from "@metro/common";
import { usePluginSettings } from "../common/usePluginSettings";
import { BaseCardOption } from "./BaseCardOption";
import type { BaseOptionRowProps } from "./BaseOptionRowProps";
import { getIcon } from "../common/getIcon";
import { TableRadioGroup, TableRadioRow } from "@components/Discord";

export function RadioOptionRow({ opt, plugin, settingKey }: BaseOptionRowProps<"radio">) {
    const [current, setCurrent] = usePluginSettings<typeof opt>(plugin.id, settingKey);

    return (
        <BaseCardOption opt={opt}>
            <RedesignCompat>
                <TableRadioGroup
                    title={opt.label}
                    hasIcons={opt.options.some(o => o.icon)}
                    value={current}
                    onChange={setCurrent}
                >
                    {opt.options.map((def, i) => (
                        <TableRadioRow
                            key={i}
                            label={def.label}
                            subLabel={def.description}
                            icon={getIcon(def.icon)}
                            value={String(def.value)}
                        />
                    ))}
                </TableRadioGroup>
            </RedesignCompat>
        </BaseCardOption>
    );
}
