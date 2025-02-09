import type { LiteralUnion } from "type-fest";
import { getComponentFromProps } from "../util";
import type * as RN from "react-native";

type FontFamily = "normal" | "medium" | "semibold" | "bold" | "extrabold";
type HeadingSize = "sm" | "md" | "lg" | "xl" | "xxl";
type TextSize = "xxs" | "xs" | "sm" | "md" | "lg";

type TextVariant = LiteralUnion<
    | `heading-${HeadingSize}/${FontFamily}`
    | `text-${TextSize}/${Exclude<FontFamily, "extrabold">}`
    | `heading-deprecated-12/${FontFamily}`
    | `redesign/${"channel-title" | "message-preview"}/${Exclude<FontFamily, "extrabold">}`
    | `redesign/heading-18/bold`
    | `display-${"sm" | "md" | "lg"}`
    | "eyebrow"
    | "code",
    string
>;

export type TextProps = RN.TextProps & {
    variant?: TextVariant;
    color?: string;
};

export default getComponentFromProps(["Text", "LegacyText"]) as React.FC<TextProps>;
