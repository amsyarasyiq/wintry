import { useToastStore } from "@stores/useToastStore";
import type { StyleProp, ViewStyle } from "react-native";

export interface ToastOptions {
    duration?: number;
    /**
     * @default true
     */
    dismissible?: boolean;
    /**
     * @default undefined
     */
    onDismiss?: () => void;
    /**
     * @default undefined
     */
    onPress?: () => void;
    /**
     * @default undefined
     */
    onAutoClose?: () => void;
    /**
     * @default undefined
     */
    contentContainerStyle?: StyleProp<ViewStyle>;
}

interface ToastInstanceBase {
    id: string;
    options?: ToastOptions;
}

export type ToastInstance = ToastInstanceBase &
    ({ type: "generic"; content: GenericToastContent } | { type: "custom"; content: CustomToastContent });

export interface CustomToastRendererProps {
    hide: () => void;
    update: (options: Partial<Omit<ToastInstance, "id">>) => void;
}

interface GenericToastContent {
    text: string;
    // icon?: React.ReactNode;
}

interface CustomToastContent {
    wrapPressable?: boolean;
    render: (props: CustomToastRendererProps) => React.ReactNode;
}

export type ToastContent = ToastInstance["content"];

export interface ToastConfig {
    id: string;
    content: ToastContent;
    options?: ToastOptions;
    type?: ToastInstance["type"];
}

export class Toast {
    id: string;

    constructor(public config: Omit<ToastConfig, "id">) {
        this.id = Math.random().toString(36).substring(7);

        this.config = {
            ...config,
            options: {
                duration: 5000,
                dismissible: true,
                ...config.options,
            },
        };
    }

    show() {
        useToastStore.getState().showToast({
            id: this.id,
            ...this.config,
        });
    }

    hide() {
        useToastStore.getState().hideToast(this.id);
    }

    update(options: Partial<Omit<ToastInstance, "id">>) {
        useToastStore.getState().updateToast(this.id, options);
    }
}

export function showToast(
    config: Omit<ToastConfig, "id" | "content"> & {
        content: string | GenericToastContent | CustomToastContent;
    },
) {
    if (typeof config.content === "string") {
        config.content = { text: config.content } as GenericToastContent;
    }

    const toast = new Toast(config as ToastConfig);
    toast.show();
    return toast;
}
