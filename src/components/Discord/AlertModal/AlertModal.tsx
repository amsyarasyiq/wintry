import { lookupByProps } from "@metro/new/common/wrappers";
import { lazyValue } from "@utils/lazy";
import type { ReactElement } from "react";

const module = lookupByProps("AlertModal", "AlertActions");

function getPropLazy(prop: string) {
    return lazyValue(() => module.load()[prop]);
}

interface AlertModalProps {
    title: string;
    content: string;
    extraContent?: ReactElement;
    actions?: ReactElement<AlertActionButtonProps>[];
}

export const AlertModal = getPropLazy("AlertModal") as React.FC<AlertModalProps>;

// biome-ignore lint/suspicious/noEmptyInterface: TODO
interface AlertModalContainerProps {}

export const AlertModalContainer = getPropLazy(
    "AlertModalContainer",
) as React.ForwardRefExoticComponent<AlertModalContainerProps>;

// biome-ignore lint/suspicious/noEmptyInterface: TODO
interface AlertActionButtonProps {}

export const AlertActionButton = getPropLazy("AlertActionButton") as React.FC<AlertActionButtonProps>;

interface AlertActionsProps {
    children: React.ReactNode;
}

export const AlertActions = getPropLazy("AlertActions") as React.FC<AlertActionsProps>;

export const useDismissModalCallback = getPropLazy("useDismissModalCallback") as () => () => void;
