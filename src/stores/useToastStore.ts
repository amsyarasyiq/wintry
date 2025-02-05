import { merge } from "es-toolkit";
import { create } from "zustand";

interface ToastOptions {
    duration?: number;
    /**
     * @default true
     */
    dismissible?: boolean;
    /**
     * @default top
     */
    position?: "top" | "bottom";
    /**
     * @default undefined
     */
    onDismiss?: () => void;
    /**
     * @default undefined
     */
    onAutoClose?: () => void;
    /**
     * @default false
     */
    fullWidth?: boolean;
}

interface ToastInstanceBase {
    id: string;
    options?: ToastOptions;
}

export type ToastInstance = ToastInstanceBase &
    ({ type: "generic"; content: GenericToastContent } | { type: "custom"; content: CustomToastContent });

interface CustomToastRendererProps {
    hide: () => void;
}

interface GenericToastContent {
    text: string;
    onPress?: () => void;
    icon?: React.ReactNode;
}

interface CustomToastContent {
    wrapPressable?: boolean;
    render: (props: CustomToastRendererProps) => React.ReactNode;
}

export type ToastContent = ToastInstance["content"];

interface ToastConfig {
    id: string;
    content: ToastContent;
    options?: ToastOptions;
    type?: ToastInstance["type"];
}

interface ToastStore {
    toasts: ToastInstance[];
    showToast(props: ToastConfig): void;
    hideToast(id: string): void;
    updateToast(id: string, options: Partial<Omit<ToastInstance, "id">>): void;
}

export const useToastStore = create<ToastStore>(set => {
    const timeouts = new Map<string, Timer>();

    return {
        toasts: [],
        showToast: ({ id, content, type = "generic", options = {} }: ToastConfig) =>
            set(state => {
                const toast = { id, type, content, options } as ToastInstance;

                if (options.duration && options.duration > 0) {
                    const timeout = setTimeout(() => {
                        set(state => {
                            options.onAutoClose?.();
                            timeouts.delete(id);
                            return {
                                toasts: state.toasts.filter(t => t.id !== id),
                            };
                        });
                    }, options.duration);

                    timeouts.set(id, timeout);
                }

                return { toasts: [...state.toasts, toast] };
            }),
        hideToast: id =>
            set(state => {
                const timeout = timeouts.get(id);
                if (timeout) {
                    clearTimeout(timeout);
                    timeouts.delete(id);
                }

                return {
                    toasts: state.toasts.filter(toast => toast.id !== id),
                };
            }),
        updateToast: (id, options) =>
            set(state => ({
                toasts: state.toasts.map(toast => {
                    if (toast.id === id) {
                        const updatedToast = merge(toast, options);
                        return updatedToast as ToastInstance;
                    }
                    return toast;
                }),
            })),
    };
});

class Toast {
    id: string;

    static show = useToastStore.getState().showToast;
    static hide = useToastStore.getState().hideToast;
    static update = useToastStore.getState().updateToast;

    constructor(public config: Omit<ToastConfig, "id">) {
        this.id = Math.random().toString(36).substring(7);

        this.config = {
            ...config,
            options: {
                duration: 5000,
                dismissible: true,
                position: "top",
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
