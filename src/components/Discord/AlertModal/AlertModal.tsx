import { lookupByProps } from "@metro/common/wrappers";
import { lazyValue } from "@utils/lazy";
import type { ReactElement, ReactNode } from "react";
import type { ButtonProps } from "../Button/Button";

const module = lookupByProps("AlertModal", "AlertActions");

function getPropLazy(prop: string) {
    return lazyValue(() => module.load()[prop]);
}

export interface AlertModalProps {
    /**
     * The header of the modal. This is placed above the title.
     */
    header?: ReactElement;
    /**
     * The title of the modal.
     */
    title?: string;
    /**
     * The content of the modal accepts a string. To render a content, preferably use `extraContent`.
     */
    content: string;
    /**
     * Extra content to display below the main content.
     */
    extraContent?: ReactNode;
    /**
     * The actions to display at the bottom of the modal.
     */
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

/**
 * A button that is used in the `AlertModal` component.
 * Unlike the `Button` component, this component will dismiss the modal when pressed.
 * If the `onPress` function returns a Promise, the button will show a loading indicator.
 */
export const AlertActionButton = getPropLazy("AlertActionButton") as React.FC<AlertActionButtonProps>;

interface AlertActionsProps {
    children: React.ReactNode;
}

export const AlertActions = getPropLazy("AlertActions") as React.FC<AlertActionsProps>;

export const useDismissModalCallback = getPropLazy("useDismissModalCallback") as () => () => void;
