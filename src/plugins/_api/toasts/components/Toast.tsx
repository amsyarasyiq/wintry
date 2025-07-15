import Animated, {
    type ComplexAnimationBuilder,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    LinearTransition,
    SlideOutUp,
    SlideInUp,
} from "react-native-reanimated";
import { Gesture, GestureDetector, Directions } from "react-native-gesture-handler";
import { View, useWindowDimensions } from "react-native";
import { createStyles } from "@components/utils/styles";
import { tokens } from "@metro/common/libraries";
import { memo, useCallback } from "react";
import { useToastStore } from "@stores/useToastStore";
import { ToastContentRenderer } from "./ToastContentRenderer";
import PressableScale from "@components/Discord/experimental/PressableScale";
import type { Toast as _Toast } from "@api/toasts";

const OFFSCREEN_LENGTH = 800;

const useStyles = createStyles(() => ({
    container: {
        maxWidth: "90%",
        alignSelf: "center",
        flexDirection: "row",
        justifyContent: "center",
        shadowColor: tokens.colors.TOAST_CONTAINER_SHADOW_COLOR,
    },
    contentContainer: {
        flexShrink: 1,
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: tokens.radii.xxl,
        padding: tokens.spacing.PX_8,
        paddingHorizontal: tokens.spacing.PX_12,
        backgroundColor: tokens.colors.TOAST_BG,
        borderColor: tokens.colors.BORDER_SUBTLE,
        borderWidth: 1,
        ...tokens.shadows.SHADOW_HIGH,
    },
}));

export default memo(function Toast({ toast }: { toast: _Toast }) {
    const styles = useStyles();
    const { width } = useWindowDimensions();

    const hideToast = useToastStore(s => s.hideToast);

    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ translateX: translationX.value }, { translateY: translationY.value }],
    }));

    const onceOnDismiss = useCallback(() => {
        toast.onDismiss?.();
        hideToast(toast.id);
    }, [hideToast, toast]);

    const pan = Gesture.Pan()
        .minDistance(20)
        .onStart(e => (translationX.value = e.translationX))
        .onChange(event => {
            translationX.value += event.changeX;
        })
        .onEnd(() => {
            const willDisappear =
                toast.dismissible && (translationX.value > width / 4 || translationX.value < -width / 4);
            const direction = Math.sign(translationX.value);
            const position = willDisappear ? OFFSCREEN_LENGTH * direction : 0;

            translationX.value = withTiming(position, undefined, finished => {
                if (finished && willDisappear) {
                    runOnJS(onceOnDismiss)();
                }
            });
        });

    const fling = Gesture.Fling()
        .simultaneousWithExternalGesture(pan)
        .direction(Directions.UP)
        .onStart(event => (translationY.value = event.y))
        .onEnd(() => {
            if (!toast.dismissible) return;

            translationY.value = withTiming(-OFFSCREEN_LENGTH, undefined, finished => {
                if (finished) {
                    runOnJS(onceOnDismiss)();
                }
            });
        });

    const setupSpringMotion = (spring: ComplexAnimationBuilder) =>
        spring.mass(0.2).damping(15).stiffness(350).restDisplacementThreshold(0.1).restSpeedThreshold(0.1);

    return (
        <GestureDetector gesture={Gesture.Simultaneous(pan, fling)}>
            <Animated.View
                pointerEvents="box-none"
                layout={LinearTransition.springify(500).dampingRatio(0.5)}
                // FadeInUp and FadeOutUp would be preferable here, but after Discord upgraded to Fabric Native Components,
                // they appear to cause no animation at all.
                entering={setupSpringMotion(SlideInUp.springify())}
                exiting={setupSpringMotion(SlideOutUp.springify())}
            >
                <PressableScale pointerEvents="box-none" disabled={!toast.onPress} onPress={toast.onPress}>
                    <Animated.View
                        layout={LinearTransition.springify(500).dampingRatio(0.5)}
                        style={[animatedStyles, styles.container, toast.contentContainerStyle]}
                    >
                        <View style={styles.contentContainer}>
                            <ToastContentRenderer toast={toast} />
                        </View>
                    </Animated.View>
                </PressableScale>
            </Animated.View>
        </GestureDetector>
    );
});
