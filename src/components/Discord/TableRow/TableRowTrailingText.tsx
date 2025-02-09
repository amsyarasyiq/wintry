import type { FC } from "react";
import { getComponentFromProps } from "../util";

interface TableRowTrailingTextProps {
    text: string;
}

type TableRowTrailingText = FC<TableRowTrailingTextProps>;

export default getComponentFromProps("TableRowTrailingText") as TableRowTrailingText;
