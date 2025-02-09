import type { FC } from "react";
import type { TableRowBaseProps } from "./TableRow";
import { getComponentFromProps } from "../util";

interface TableSwitchRowProps extends TableRowBaseProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
}

export type TableSwitchRow = FC<TableSwitchRowProps>;

export default getComponentFromProps("TableSwitchRow") as TableSwitchRow;
