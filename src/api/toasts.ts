import { useToastStore } from "@stores/useToastStore";
import type { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";

export interface ToastOptions {
    duration?: number;
    dismissible?: boolean;
    onDismiss?: () => void;
    onPress?: () => void;
    onTimeout?: () => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
}

export interface GenericToastContent {
    text: string;
    icon?: React.ReactNode | React.ComponentType | ImageSourcePropType;
}

export interface CustomToastProps {
    controller: ToastController;
}

export interface CustomToastContent {
    /**
     * Avoid using states in the custom renderer, as components may be re-rendered unexpectedly multiple times
     */
    render: (props: CustomToastProps) => React.ReactNode;
}

export interface ToastConfig {
    id: string;
}

export interface ToastUtils {
    use: <T>(selector: (toast: Toast) => T) => T;
}

export interface ToastController {
    show: () => ToastController;
    hide: () => ToastController;
    update: (newConfig: Partial<Toast>) => ToastController;
}

export type ToastContent = GenericToastContent & CustomToastContent;
export type ToastProps = ToastConfig & Partial<ToastContent> & ToastOptions;
export type Toast = ToastProps & ToastUtils;

/**
 * Show a toast notification
 * @param text Simple text toast (most common use case)
 * @param options Additional options
 * @returns Toast control object with hide and update methods
 */
export function showToast(text: string): ToastController;

/**
 * Show a toast with custom content
 * @param content Toast config
 * @returns Toast control object with hide and update methods
 */
export function showToast(content: ToastProps): ToastController;

export function showToast(configOrText: string | ToastProps): ToastController {
    let id: string;

    // Parse the content
    let toastProps: ToastProps;

    if (typeof configOrText === "string") {
        id = configOrText; // TODO: Hash the text to generate an ID
        toastProps = { id: configOrText, text: configOrText };
    } else {
        id = configOrText.id;
        toastProps = configOrText;
    }

    const toast: Toast = {
        use: selector => useToastStore(state => selector(state.getToast(id) ?? toast)),
        ...toastProps,
    };

    // Show the toast
    const showToast = () =>
        useToastStore.getState().updateToast({
            duration: 5000,
            dismissible: true,
            ...(useToastStore.getState().getToast(id) ?? toast),
        });

    showToast();

    const controller: ToastController = {
        show: () => {
            showToast();
            return controller;
        },
        hide: () => {
            useToastStore.getState().hideToast(id);
            return controller;
        },
        update: newConfig => {
            useToastStore.getState().updateToast({ ...toast, ...newConfig, id });
            return controller;
        },
    };

    return controller;
}
