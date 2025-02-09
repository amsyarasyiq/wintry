import type { ReactNode } from "react";
import { getComponentFromProps } from "../util";

export interface TableRowGroupProps {
    title?: string;
    children: ReactNode;
}

type TableRowGroup = React.FC<TableRowGroupProps>;

export default getComponentFromProps("TableRowGroup") as TableRowGroup;
