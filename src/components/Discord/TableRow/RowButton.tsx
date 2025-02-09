import type { ReactNode } from "react";
import type { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import type { LiteralUnion } from "type-fest";
import type { ButtonVariant } from "../Button/BaseButton";
import { getComponentFromProps } from "../util";

export interface RowButtonProps {
    variant?: LiteralUnion<ButtonVariant, string>;
    style?: StyleProp<ViewStyle>;
    icon?: ImageSourcePropType | ReactNode;
    label: string | ReactNode;
    subLabel?: string | ReactNode;
    onPress: () => void;
    disabled?: boolean;
}

type RowButton = React.FC<RowButtonProps>;

export default getComponentFromProps("RowButton") as RowButton;
