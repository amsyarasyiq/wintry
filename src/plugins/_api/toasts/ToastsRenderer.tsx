import type { ToastInstance } from "@api/toasts";
import { FluxUtils } from "@metro/common";
import { useToastStore } from "@stores/useToastStore";
import { useEffect, useMemo, useRef } from "react";
import { ToasterBase } from "react-native-customizable-toast" with { lazy: "on" };
import type { ToastItemProps, ToasterMethods } from "react-native-customizable-toast";
import { SlideInUp, SlideOutUp, clamp, withSpring } from "react-native-reanimated";
import { ToastComponent } from "./ToastComponent";
import { findByStoreName } from "@metro";

const ToastStore = findByStoreName("ToastStore");

export function ToastsRenderer() {
    const ref = useRef<ToasterMethods<ToastInstance>>(null);

    // The toast library has its own store, so we need to keep it and ours in sync
    const toastRegistry = useMemo(() => new Map<string, string>(), []);
    const toasts = useToastStore(state => state.toasts);

    const toastStyleWorklet = useToastStyleWorklet();

    useEffect(() => {
        // Show new toasts or update existing ones
        for (const toast of toasts) {
            const { id } = toast;

            if (toastRegistry.has(id)) {
                ref.current?.update(id, toast);
            } else {
                const libId = ref.current?.show(toast);
                if (libId != null) toastRegistry.set(id, libId);
            }
        }

        // Hide toasts that are no longer in the store
        for (const [id, libId] of toastRegistry) {
            if (!toasts.some(t => t.id === id)) {
                toastRegistry.delete(id);
                ref.current?.hide(libId);
            }
        }
    }, [toasts, toastRegistry]);

    return (
        <ToasterBase<typeof ref>
            entering={SlideInUp.springify().mass(0.1).damping(10).stiffness(100).overshootClamping(1)}
            exiting={SlideOutUp.springify()
                .mass(0.35)
                .damping(15)
                .stiffness(350)
                .restDisplacementThreshold(0.1)
                .restSpeedThreshold(0.1)}
            useSafeArea={true}
            // @ts-expect-error - Passing function as ref is valid.
            ref={(r: (typeof ref)["current"]) => r && (ref.current = r)}
            itemStyle={toastStyleWorklet}
            onSwipeEdge={({ filter }) => filter(t => t.options?.dismissible === false)}
            render={ToastComponent}
        />
    );
}
function useToastStyleWorklet() {
    const isDiscordToastActive = FluxUtils.useStateFromStores([ToastStore], () => ToastStore.getContent()) != null;

    return ({ itemLayout: { y }, gesture: { translationY }, displayFromBottom }: ToastItemProps) => {
        "worklet";

        return {
            transform: [
                {
                    // 50 is hardcoded. If you don't like it, implement a way to measure the actual height of the toast.
                    translateY: withSpring(clamp(translationY.value, -y.value, 0) + (isDiscordToastActive ? 50 : 0), {
                        mass: 0.1,
                        damping: 10,
                        stiffness: 100,
                        overshootClamping: true,
                    }),
                },
                displayFromBottom ? { rotate: "-180deg" } : { rotate: "0deg" },
            ],
        };
    };
}
