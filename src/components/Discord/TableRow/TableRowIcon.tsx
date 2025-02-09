import type { ImageSourcePropType, ImageStyle, StyleProp } from "react-native";
import { getComponentFromProps } from "../util";
import type { LiteralUnion } from "type-fest";

export interface TableRowIconProps {
    style?: StyleProp<ImageStyle>;
    variant?: LiteralUnion<"danger", string>;
    source: ImageSourcePropType | undefined;
}

type TableRowIcon = React.FC<TableRowIconProps>;

export default getComponentFromProps("TableRowIcon") as TableRowIcon;
