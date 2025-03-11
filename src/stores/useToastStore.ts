import type { Toast } from "@api/toasts";
import { create } from "zustand";

interface ToastStore {
    toasts: Toast[];

    getToast(id: string): Toast | undefined;
    hideToast(id: string): void;
    updateToast(config: Partial<Toast> & { id: string }): void;
}

export const useToastStore = create<ToastStore>((set, get) => {
    const timeouts = new Map<string, Timer>();

    const handleTimeout = (id: string, onTimeout?: () => void) => {
        set(state => {
            onTimeout?.();
            timeouts.delete(id);
            return {
                toasts: state.toasts.filter(t => t.id !== id),
            };
        });
    };

    const clearToastTimeout = (id: string) => {
        if (timeouts.has(id)) {
            clearTimeout(timeouts.get(id)!);
            timeouts.delete(id);
        }
    };

    const setToastTimeout = (toast: Toast) => {
        if (toast.duration && toast.duration > 0) {
            const timeout = setTimeout(() => handleTimeout(toast.id, toast.onTimeout), toast.duration);
            timeouts.set(toast.id, timeout);
        }
    };

    return {
        toasts: [],

        getToast: id => get().toasts.find(toast => toast.id === id),

        hideToast: id =>
            set(state => {
                clearToastTimeout(id);
                return {
                    toasts: state.toasts.filter(toast => toast.id !== id),
                };
            }),

        updateToast: config => {
            if (config.id && get().getToast(config.id) === undefined) {
                set(state => {
                    setToastTimeout(config as Toast);
                    return {
                        toasts: [...state.toasts, config as Toast],
                    };
                });
            } else {
                set(state => ({
                    toasts: state.toasts.map(toast => {
                        if (toast.id === config.id) {
                            const updatedToast = { ...toast, ...config };

                            if ("duration" in config && config.duration! > 0) {
                                clearToastTimeout(config.id);
                                setToastTimeout(updatedToast);
                            }

                            return updatedToast;
                        }
                        return toast;
                    }),
                }));
            }
        },
    };
});
