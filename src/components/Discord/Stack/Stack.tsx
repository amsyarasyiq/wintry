import type { StyleProp, ViewStyle } from "react-native";
import { getComponentFromProps } from "../util";
import type { ReactNode } from "react";

interface StackProps {
    /** defaults to vertical */
    direction?: "vertical" | "horizontal";
    /** defaults to 8 */
    spacing?: number;

    align?: ViewStyle["alignItems"];
    justify?: ViewStyle["justifyContent"];

    style?: StyleProp<ViewStyle>;
    children: ReactNode;
}

export default getComponentFromProps<StackProps>("Stack");
