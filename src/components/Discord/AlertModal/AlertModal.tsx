import { lookupByProps } from "@metro/common/wrappers";
import { lazyValue } from "@utils/lazy";
import type { ReactElement, ReactNode } from "react";
import type { ButtonProps } from "../Button/Button";

const module = lookupByProps("AlertModal", "AlertActions");

function getPropLazy(prop: string) {
    return lazyValue(() => module.load()[prop]);
}

export interface AlertModalProps {
    header?: ReactElement;
    title?: string;
    content: string;
    extraContent?: ReactNode;
    actions?: ReactElement<AlertActionButtonProps>[];
}

export const AlertModal = getPropLazy("AlertModal") as React.FC<AlertModalProps>;

// TODO
// biome-ignore lint/suspicious/noEmptyInterface:
interface AlertModalContainerProps {}

export const AlertModalContainer = getPropLazy(
    "AlertModalContainer",
) as React.ForwardRefExoticComponent<AlertModalContainerProps>;

export interface AlertActionButtonProps extends ButtonProps {
    onPress: () => unknown | Promise<unknown>;
}

export const AlertActionButton = getPropLazy("AlertActionButton") as React.FC<AlertActionButtonProps>;

interface AlertActionsProps {
    children: React.ReactNode;
}

export const AlertActions = getPropLazy("AlertActions") as React.FC<AlertActionsProps>;

export const useDismissModalCallback = getPropLazy("useDismissModalCallback") as () => () => void;
