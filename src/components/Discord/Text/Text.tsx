import type { LiteralUnion } from "type-fest";
import { getComponentFromProps } from "../util";
import type * as RN from "react-native";
import type { SemanticColor } from "../types";
import type { SnakeCaseToKebab } from "@utils/types";

type BasicTextSize = "sm" | "md" | "lg";
type TextSize = "xxs" | "xs" | BasicTextSize | "xl" | "xxl";
type TextWeight = "normal" | "medium" | "semibold" | "bold" | "extrabold";
type KebabSemanticColor = SnakeCaseToKebab<SemanticColor>;

type TextVariant = LiteralUnion<
    | `heading-${Exclude<TextSize, "xxs" | "xs">}/${TextWeight}`
    | `text-${Exclude<TextSize, "xl" | "xxl">}/${Exclude<TextWeight, "extrabold">}`
    | `heading-deprecated-12/${TextWeight}`
    | `redesign/${"channel-title" | "message-preview"}/${Exclude<TextWeight, "extrabold">}`
    | `redesign/heading-18/bold`
    | `display-${BasicTextSize}`
    | "eyebrow",
    string
>;

export type TextProps = RN.TextProps & {
    variant?: TextVariant;
    color?: LiteralUnion<KebabSemanticColor, string>;
    tabularNumbers?: boolean;
    animated?: boolean;
    experimental_useNativeText?: boolean;
};

export default getComponentFromProps(["Text", "LegacyText"]) as React.FC<TextProps>;
