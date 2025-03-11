import type { OptionDefinition } from "@plugins/types";
import type React from "react";
import type { BaseOptionRowProps } from "./BaseOptionRowProps";
import { StringOptionRow } from "./StringOptionRow";
import { BooleanOptionRow } from "./BooleanOptionRow";
import { SelectOptionRow } from "./SelectOptionRow";
import { RadioOptionRow } from "./RadioOptionRow";
import { SliderOptionRow } from "./SliderOptionRow";

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
