import type { FC } from "react";
import type { TableRowBaseProps } from "./TableRow";
import { getComponentFromProps } from "../util";

export interface TableRadioRowProps extends TableRowBaseProps {
    value: string;
}

type TableRadioRow = FC<TableRadioRowProps>;

export default getComponentFromProps("TableRadioRow") as TableRadioRow;
