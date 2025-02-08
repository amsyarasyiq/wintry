import type { ReactNode } from "react";
import type { BaseButtonProps } from "./BaseButton";
import { getComponentFromProps } from "../util";

export type FloatingActionButtonProps = BaseButtonProps & {
    icon: ReactNode;
    positionBottom?: number;
};

export default getComponentFromProps<FloatingActionButtonProps>("FloatingActionButton", { singular: true });
