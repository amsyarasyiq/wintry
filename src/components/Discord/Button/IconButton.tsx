import type { ReactNode } from "react";
import type { BaseButtonProps } from "./BaseButton";
import { getComponentFromProps } from "../util";

export type IconButtonProps = BaseButtonProps & {
    icon: ReactNode;
};

export default getComponentFromProps<IconButtonProps>("IconButton", { singular: true });
