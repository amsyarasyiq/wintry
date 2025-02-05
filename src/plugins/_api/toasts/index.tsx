import { definePlugin, meta } from "#plugin-context";
import { createStyles } from "@components/utils/styles";
import { Devs } from "@data/constants";
import { findByFilePath, findByStoreName } from "@metro";
import { Card, FluxUtils, Text } from "@metro/common";
import { metroEventEmitter } from "@metro/internal/events";
import { createContextualPatcher } from "@patcher/contextual";
import { createRef } from "react";
import { Pressable } from "react-native";
import { Swipeable, ToasterBase, useToast } from "react-native-customizable-toast" with { lazy: "on" };
import type { ToastItemProps, ToasterMethods } from "react-native-customizable-toast";
import { SlideInUp, SlideOutUp, clamp, withSpring } from "react-native-reanimated";

const patcher = createContextualPatcher({ pluginId: meta.id });

const ToastContainer = findByFilePath("modules/toast/native/ToastContainer.tsx", true);

let CustomToasterRef: React.MutableRefObject<ToasterMethods<CustomToaster>>;

metroEventEmitter.once("metroReady", () => {
    // @ts-expect-error - It is actually mutable
    CustomToasterRef = createRef<ToasterMethods<CustomToaster>>();
});

const useStyles = createStyles(() => ({
    container: {
        marginTop: 10,
        marginHorizontal: 10,
    },
    touchable: {
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 5,
        padding: 10,
        minHeight: 48,
    },
}));

export const CustomToasterHelper = {
    show: (options: CustomToaster) => CustomToasterRef.current?.show(options)!,
    hide: (id: string) => CustomToasterRef.current?.hide(id),
    filter: (fn: (value: CustomToaster, index: number) => void) => CustomToasterRef.current?.filter(fn),
    update: (id: string, options: Partial<CustomToaster>) => CustomToasterRef.current?.update(id, options),
};

type CustomToaster = {
    text: string;
    dismissible?: boolean;
};

const CustomToastComponent = () => {
    const styles = useStyles();
    const { text, hide, dismissible = true } = useToast<CustomToaster>();

    return (
        <Swipeable onSwipe={hide} disabled={!dismissible}>
            <Card style={styles.container}>
                <Pressable style={styles.touchable} onPress={hide} disabled={!dismissible}>
                    <Text variant="display-lg">{text}</Text>
                </Pressable>
            </Card>
        </Swipeable>
    );
};

export const CustomToaster = () => {
    const ToastStore = findByStoreName("ToastStore");
    const isDiscordToastDisplaying = FluxUtils.useStateFromStores([ToastStore], () => ToastStore.getContent()) != null;

    return (
        <ToasterBase<typeof CustomToasterRef>
            entering={SlideInUp.springify().mass(0.1).damping(10).stiffness(100).overshootClamping(1)}
            exiting={SlideOutUp.springify()
                .mass(0.35)
                .damping(15)
                .stiffness(350)
                .restDisplacementThreshold(0.1)
                .restSpeedThreshold(0.1)}
            useSafeArea={true}
            // @ts-expect-error - Passing function as ref is valid.
            ref={(r: ToasterMethods<CustomToaster>) => r && (CustomToasterRef.current = r)}
            itemStyle={({
                itemLayout: { y },
                gesture: { translationY },
                properties: { loading },
                displayFromBottom,
            }: ToastItemProps) => {
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
            onSwipeEdge={({ filter }) => filter(e => !e.dismissible)}
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
        // Testing purposes
        window.ToasterHelper = CustomToasterHelper;
        window.demoToast = () => {
            const id = CustomToasterHelper.show({
                text: "Hello, world!",
                dismissible: true,
            });

            setTimeout(() => {
                CustomToasterHelper.update(id, {
                    text: "Bye-bye, world!",
                });

                setTimeout(() => {
                    CustomToasterHelper.hide(id);
                }, 3000);
            }, 1000);
        };

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
