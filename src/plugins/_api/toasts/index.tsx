import { definePlugin, meta } from "#plugin-context";
import { createStyles } from "@components/utils/styles";
import { Devs } from "@data/constants";
import { findAssetId, findByFilePath, findByStoreName } from "@metro";
import { Button, FluxUtils, PressableScale, Text, tokens } from "@metro/common";
import { createContextualPatcher } from "@patcher/contextual";
import { showToast, useToastStore, type ToastInstance } from "@stores/useToastStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, View } from "react-native";
import { Swipeable, ToasterBase, useToast } from "react-native-customizable-toast" with { lazy: "on" };
import type { ToastItemProps, ToasterMethods } from "react-native-customizable-toast";
import { SlideInUp, SlideOutUp, clamp, withSpring } from "react-native-reanimated";

const patcher = createContextualPatcher({ pluginId: meta.id });

const ToastStore = findByStoreName("ToastStore");
const ToastContainer = findByFilePath("modules/toast/native/ToastContainer.tsx", true);

const useContainerStyles = createStyles(() => ({
    container: {
        marginTop: tokens.spacing.PX_8,
        marginHorizontal: tokens.spacing.PX_12,
        alignSelf: "center",
        flexDirection: "row",
        justifyContent: "center",
        shadowColor: tokens.colors.TOAST_CONTAINER_SHADOW_COLOR,
    },
    contentContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: tokens.radii.xxl,
        padding: tokens.spacing.PX_8,
        paddingHorizontal: tokens.spacing.PX_12,
        backgroundColor: tokens.colors.TOAST_BG,
        borderColor: tokens.colors.BORDER_SUBTLE,
        borderWidth: 1,
        ...tokens.shadows.SHADOW_HIGH,
    },
}));

const CustomToastComponent = () => {
    const containerStyles = useContainerStyles();
    const { hide, ...toast } = useToast<ToastInstance>();

    if (toast.id == null) return null;
    const { type, content, options = {} } = toast;

    if (type === "generic") {
        return (
            <Swipeable onSwipe={() => options.onDismiss?.()} disabled={!options.dismissible}>
                <PressableScale style={containerStyles.container} onPress={() => content.onPress?.()}>
                    <View style={[containerStyles.contentContainer, options.fullWidth && { width: "100%" }]}>
                        <Text variant="text-sm/semibold">{toast.content.text}</Text>
                    </View>
                </PressableScale>
            </Swipeable>
        );
    }

    if (type === "custom") {
        const { render: CustomComponent, wrapPressable = true } = content;

        const toastContent = (
            <View style={[containerStyles.contentContainer, options.fullWidth && { width: "100%" }]}>
                <CustomComponent hide={hide} />
            </View>
        );

        const wrappedContent = wrapPressable ? (
            <PressableScale style={containerStyles.container}>{toastContent}</PressableScale>
        ) : (
            <View style={containerStyles.container}>{toastContent}</View>
        );

        return (
            <Swipeable onSwipe={() => options.onDismiss?.()} disabled={!options.dismissible}>
                {wrappedContent}
            </Swipeable>
        );
    }

    if (__DEV__) throw new Error(`Unknown toast type: ${type}`);
    return null;
};

export const CustomToaster = () => {
    const ref = useRef<ToasterMethods<ToastInstance>>(null);
    const toastIdMap = useMemo(() => new Map<string, string>(), []);

    const toasts = useToastStore(state => state.toasts);
    const isDiscordToastDisplaying = FluxUtils.useStateFromStores([ToastStore], () => ToastStore.getContent()) != null;

    useEffect(() => {
        for (const toast of toasts) {
            const { id } = toast;

            if (toastIdMap.has(id)) {
                ref.current?.update(id, toast);
            } else {
                const libId = ref.current?.show(toast);
                if (libId != null) toastIdMap.set(id, libId);
            }
        }

        for (const [id, libId] of toastIdMap) {
            if (!toasts.some(t => t.id === id)) {
                toastIdMap.delete(id);
                ref.current?.hide(libId);
            }
        }
    }, [toasts, toastIdMap]);

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
            ref={(r: ToasterMethods<CustomToaster>) => r && (ref.current = r)}
            itemStyle={({ itemLayout: { y }, gesture: { translationY }, displayFromBottom }: ToastItemProps) => {
                "worklet";

                const translateY = clamp(translationY.value, -y.value, 0);

                return {
                    transform: [
                        {
                            translateY: withSpring(translateY + (isDiscordToastDisplaying ? 50 : 0), {
                                mass: 0.1,
                                damping: 10,
                                stiffness: 100,
                                overshootClamping: true,
                            }),
                        },
                        displayFromBottom ? { rotate: "-180deg" } : { rotate: "0deg" },
                    ],
                };
            }}
            onSwipeEdge={({ filter }) => filter(t => t.options?.dismissible === false)}
            render={CustomToastComponent}
        />
    );
};

export default definePlugin({
    name: "Toasts",
    description: "Provides a toast notification API.",
    authors: [Devs.Pylix],
    required: true,

    start() {
        const DemoComponent = ({ hide }: { hide: () => void }) => {
            const [update, setUpdate] = useState(false);

            useEffect(() => {
                setInterval(() => {
                    setUpdate(v => !v);
                }, 1000);
            }, []);

            return (
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center", minHeight: 48 }}>
                    <Image source={findAssetId("ic_checkmark")} style={{ width: 24, height: 24 }} />
                    <Text>{update ? "Updating" : "Updated!"}</Text>
                    {update && <Button text={"Dismiss"} onPress={hide} />}
                </View>
            );
        };

        window.demoToast = () => {
            showToast({
                type: "custom",
                content: {
                    render: DemoComponent,
                },
                options: {
                    dismissible: true,
                    duration: 10000,
                },
            });
        };

        window.showToast = showToast;

        patcher.after(ToastContainer, "type", (_, res) => {
            return (
                <>
                    {res}
                    <CustomToaster />
                </>
            );
        });
    },
});
