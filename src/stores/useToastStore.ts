import type { ToastConfig, ToastInstance } from "@api/toasts";
import { merge } from "es-toolkit";
import { create } from "zustand";

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
