import type { ReactNode } from "react";
import { getComponentFromProps } from "../util";
import type { StyleProp, ViewStyle } from "react-native";
import type { LiteralUnion } from "type-fest";

//style={{ gap: 12 }} start={false} end={false} shadow="none" border="none"
interface CardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    start?: boolean;
    end?: boolean;
    onPress?: () => void;

    variant?: LiteralUnion<"primary" | "secondary", string>;
    shadow?: LiteralUnion<"none", string>;
    border?: LiteralUnion<"none", string>;
}

export default getComponentFromProps<CardProps>("Card");
