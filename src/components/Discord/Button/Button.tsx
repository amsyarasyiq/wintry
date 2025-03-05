import { getComponentFromProps } from "../util";
import type { BaseButtonProps } from "./BaseButton";

export type ButtonProps = BaseButtonProps & {
    text: string;
    iconPosition?: "start" | "end";
    grow?: boolean;
};

export default getComponentFromProps<ButtonProps>("Button", { singular: true });
