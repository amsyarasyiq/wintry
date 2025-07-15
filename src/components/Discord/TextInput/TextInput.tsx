import type { PressableProps, StyleProp, TextStyle } from "react-native";
import { getComponentFromProps } from "../util";
import type { TextInputProps as RNTextInputProps } from "react-native";

export interface TextInputProps extends Omit<RNTextInputProps, "onChange" | "onChangeText"> {
    defaultValue?: string;
    description?: string;
    editable?: boolean;
    errorMessage?: string;
    focusable?: boolean;
    grow?: boolean;
    isCentered?: boolean;
    isClearable?: boolean;
    isDisabled?: boolean;
    isRound?: boolean;
    label?: string;

    leadingIcon?: React.ComponentType<Record<string, unknown>>;
    leadingPressableProps?: PressableProps;
    leadingText?: string;

    onChange?: (text: string) => void;

    size?: "sm" | "md" | "lg";
    state?: "error" | "default";
    style?: StyleProp<TextStyle>;

    trailingIcon?: React.ComponentType<Record<string, unknown>>;
    trailingPressableProps?: PressableProps;
    trailingText?: string;
}

export default getComponentFromProps<TextInputProps>("TextInput", { singular: true });
