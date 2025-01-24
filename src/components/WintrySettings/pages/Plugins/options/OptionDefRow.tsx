import type { OptionDefinition } from "../../../../../plugins/types";
import type React from "react";
import type { BaseOptionRowProps } from "./BaseOptionRowProps";
import { StringOptionRow } from "./StringOptionRow";
import { BooleanOptionRow } from "./BooleanOptionRow";
import { SelectOptionRow } from "./SelectOptionRow";
import { RadioOptionRow } from "./RadioOptionRow";
import { TableRow } from "../../../../../metro/common";

// TODO: Implement SliderOptionRow
function SliderOptionRow({ opt, plugin, settingKey }: BaseOptionRowProps<"slider">) {
    return <TableRow label="Slider is not supported yet :(" />;
}

export function OptionDefRow(props: BaseOptionRowProps) {
    const componentMap = {
        string: StringOptionRow,
        boolean: BooleanOptionRow,
        select: SelectOptionRow,
        radio: RadioOptionRow,
        slider: SliderOptionRow,
    } as Record<OptionDefinition["type"], React.FC<BaseOptionRowProps>>;

    const Component = componentMap[props.opt.type];
    return Component ? <Component {...props} /> : null;
}
