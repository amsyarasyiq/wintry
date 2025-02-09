import type { FC } from "react";
import type { TableRowBaseProps } from "./TableRow";
import { getComponentFromProps } from "../util";

export interface TableCheckboxRowProps extends TableRowBaseProps {
    checked: boolean;
    onPress: () => void;
}

type TableCheckboxRow = FC<TableCheckboxRowProps>;

export default getComponentFromProps("TableCheckboxRow") as TableCheckboxRow;
