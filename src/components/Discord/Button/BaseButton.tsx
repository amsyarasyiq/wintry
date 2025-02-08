import type { ReactNode } from "react";
import type { ButtonProps, StyleProp, ViewStyle } from "react-native";
import type { LiteralUnion } from "type-fest";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "active";
export type ButtonSize = "sm" | "md" | "lg";

export interface BaseButtonProps extends Omit<ButtonProps, "children" | "title"> {
    onPress: () => void;
    label?: string;
    loading?: boolean;
    icon?: ReactNode;
    shiny?: boolean;
    disabled?: boolean;
    size?: LiteralUnion<ButtonSize, string>;
    variant?: LiteralUnion<ButtonVariant, string>;
    style?: StyleProp<ViewStyle>;
    scaleAmountInPx?: number;
}
