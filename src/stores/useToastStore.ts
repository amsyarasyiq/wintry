import type { Toast } from "@api/toasts";
import { merge } from "es-toolkit";
import { create } from "zustand";

interface ToastStore {
    toasts: Toast[];

    getToast(id: string): Toast | undefined;
    showToast(props: Toast): void;
    hideToast(id: string): void;
    updateToast(id: string, config: Partial<Toast>): void;
}

export const useToastStore = create<ToastStore>((set, get) => {
    const timeouts = new Map<string, Timer>();

    return {
        toasts: [],
        getToast: id => get().toasts.find(toast => toast.id === id),
        showToast: (toast: Toast) =>
            set(state => {
                if (state.toasts.some(t => t.id === toast.id)) {
                    return state;
                }

                if (timeouts.has(toast.id)) {
                    clearTimeout(timeouts.get(toast.id)!);
                    timeouts.delete(toast.id);
                }

                if (toast.duration && toast.duration > 0) {
                    const timeout = setTimeout(() => {
                        set(state => {
                            toast.onTimeout?.();
                            timeouts.delete(toast.id);
                            return {
                                toasts: state.toasts.filter(t => t.id !== toast.id),
                            };
                        });
                    }, toast.duration);

                    timeouts.set(toast.id, timeout);
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
        updateToast: (id, updatedConfig) =>
            set(state => ({
                toasts: state.toasts.map(toast => {
                    if (toast.id === id) {
                        const isDurationDefined = "duration" in updatedConfig;
                        const updatedToast = merge({ ...toast }, updatedConfig);

                        if (isDurationDefined && updatedConfig.duration! > 0) {
                            if (timeouts.has(id)) {
                                clearTimeout(timeouts.get(id)!);
                            }

                            const timeout = setTimeout(() => {
                                set(state => {
                                    toast.onTimeout?.();
                                    timeouts.delete(id);

                                    return {
                                        toasts: state.toasts.filter(t => t.id !== id),
                                    };
                                });
                            }, updatedConfig.duration);

                            timeouts.set(id, timeout);
                        }

                        return updatedToast as Toast;
                    }
                    return toast;
                }),
            })),
    };
});
