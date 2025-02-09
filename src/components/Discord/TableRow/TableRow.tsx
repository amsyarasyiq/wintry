import type { ReactNode } from "react";
import type { LiteralUnion } from "type-fest";
import { getComponentFromProps } from "../util";

export interface TableRowBaseProps {
    arrow?: boolean;
    label: string | ReactNode;
    subLabel?: string | ReactNode;
    start?: boolean;
    end?: boolean;
    variant?: LiteralUnion<"danger", string>;
    icon?: JSX.Element | false | null;
    disabled?: boolean;
    trailing?: ReactNode | React.ComponentType<any>;
}

export interface TableRowProps extends TableRowBaseProps {
    onPress?: () => void;
}

type TableRow = React.FC<TableRowProps> & {
    Icon: typeof import("./TableRowIcon").default;
    TrailingText: typeof import("./TableRowTrailingText").default;
    Arrow: typeof import("./TableRowArrow").default;
};

export default getComponentFromProps("TableRow") as TableRow;
