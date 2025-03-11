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
    render: (props: CustomToastProps) => React.ReactNode;
}

export interface ToastConfig {
    id: string;
}

export interface ToastController {
    show: () => ToastController;
    hide: () => ToastController;
    update: (newOptions: Partial<Toast>) => ToastController;
}

export type ToastContent = GenericToastContent & CustomToastContent;
export type Toast = ToastConfig & Partial<ToastContent> & ToastOptions;

/**
 * Show a toast notification
 * @param text Simple text toast (most common use case)
 * @param options Additional options
 * @returns Toast control object with hide and update methods
 */
export function showToast(text: string): ToastController;

/**
 * Show a toast with custom content
 * @param content Toast content (either text object or custom renderer)
 * @param options Additional options
 * @returns Toast control object with hide and update methods
 */
export function showToast(content: Toast): ToastController;

export function showToast(configOrText: string | Toast): ToastController {
    let id: string;

    // Parse the content
    let toast: Toast;

    if (typeof configOrText === "string") {
        id = configOrText; // TODO: Hash the text to generate an ID
        toast = { id: configOrText, text: configOrText };
    } else {
        id = configOrText.id;
        toast = configOrText;
    }

    // Show the toast
    const show = () =>
        useToastStore.getState().showToast({
            duration: 5000,
            dismissible: true,
            ...(useToastStore.getState().getToast(id) ?? toast),
        });

    show();

    const controller: ToastController = {
        show: () => {
            show();
            return controller;
        },
        hide: () => {
            useToastStore.getState().hideToast(id);
            return controller;
        },
        update: (newConfig: Partial<Toast>) => {
            useToastStore.getState().updateToast(id, newConfig);
            return controller;
        },
    };

    return controller;
}
