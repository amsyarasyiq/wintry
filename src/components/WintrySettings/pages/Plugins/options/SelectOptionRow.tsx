import { TableCheckboxRow, TableRowGroup } from "@metro/common";
import { BaseCardOption } from "./BaseCardOption";
import type { BaseOptionRowProps } from "./BaseOptionRowProps";
import { getIcon } from "../common/getIcon";
import { usePluginSettings } from "../common/usePluginSettings";

export function SelectOptionRow({ opt, plugin, settingKey }: BaseOptionRowProps<"select">) {
    const [selected, setSelected] = usePluginSettings<typeof opt>(plugin.id, settingKey);

    const handleToggleOption = (value: (typeof selected)[number]) => {
        setSelected(currentSelected => {
            const isCurrentlySelected = currentSelected.includes(value);
            return isCurrentlySelected ? currentSelected.filter(v => v !== value) : [...currentSelected, value];
        });
    };

    return (
        <BaseCardOption opt={opt}>
            <TableRowGroup title={opt.label}>
                {opt.options.map((option, index) => (
                    <TableCheckboxRow
                        key={index}
                        label={option.label}
                        subLabel={option.description}
                        icon={getIcon(option.icon)}
                        checked={selected.includes(option.value)}
                        onPress={() => handleToggleOption(option.value)}
                    />
                ))}
            </TableRowGroup>
        </BaseCardOption>
    );
}
