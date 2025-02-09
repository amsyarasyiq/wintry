import type { FC, ReactNode } from "react";
import { getComponentFromProps } from "../util";

export interface TableRadioGroupProps {
    title: string;
    value: string | number | boolean;
    hasIcons?: boolean;
    onChange: <T extends string>(type: T) => void;
    children: ReactNode;
}

type TableRadioGroup = FC<TableRadioGroupProps>;

export default getComponentFromProps("TableRadioGroup") as TableRadioGroup;
