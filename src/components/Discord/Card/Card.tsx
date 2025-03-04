import type { ReactNode } from "react";
import { getComponentFromProps } from "../util";
import type { StyleProp, ViewStyle } from "react-native";
import type { LiteralUnion } from "type-fest";

interface CardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    start?: boolean;
    end?: boolean;
    onPress?: () => void;

    variant?: LiteralUnion<"primary" | "secondary" | "transparent", string>;
    shadow?: LiteralUnion<"none" | "border" | "high" | "ledge" | "low" | "medium", string>;
    border?: LiteralUnion<"none" | "subtle" | "strong" | "faint", string>;
}

export default getComponentFromProps<CardProps>("Card");
