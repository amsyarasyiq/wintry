import type { ToastInstance } from "@api/toasts";
import { Text } from "@components/Discord";
import PressableScale from "@components/Discord/experimental/PressableScale";
import { createStyles } from "@components/utils/styles";
import { tokens } from "@metro/common/libraries";
import { useToastStore } from "@stores/useToastStore";
import { useCallback, useState, type PropsWithChildren } from "react";
import { View, useWindowDimensions, type StyleProp, type TextLayoutEventData, type ViewStyle } from "react-native";
import { Swipeable, useToast } from "react-native-customizable-toast" with { lazy: "on" };
import Animated, { LinearTransition } from "react-native-reanimated";
import { useShallow } from "zustand/shallow";

const useContainerStyles = createStyles(() => ({
    pressable: {
        marginTop: tokens.spacing.PX_8,
        marginHorizontal: tokens.spacing.PX_12,
    },
    container: {
        alignSelf: "center",
        flexDirection: "row",
        justifyContent: "center",
        shadowColor: tokens.colors.TOAST_CONTAINER_SHADOW_COLOR,
    },
    contentContainer: {
        overflow: "hidden",
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

function ToastContainer({
    children,
    contentContainerStyle,
    dismissible,
    onDismiss,
    onPress,
}: PropsWithChildren<{
    contentContainerStyle?: StyleProp<ViewStyle>;
    dismissible: boolean;
    onDismiss: () => void;
    onPress?: () => void;
}>) {
    const { width: screenWidth } = useWindowDimensions();
    const containerStyles = useContainerStyles();

    return (
        <Swipeable onSwipe={onDismiss} disabled={!dismissible}>
            <PressableScale style={containerStyles.pressable} disabled={!onPress} onPress={() => onPress?.()}>
                <View style={[containerStyles.container]}>
                    <Animated.View
                        layout={LinearTransition.springify().duration(500).dampingRatio(0.5)}
                        style={[
                            { maxWidth: screenWidth - 16 },
                            containerStyles.contentContainer,
                            contentContainerStyle,
                        ]}
                    >
                        {children}
                    </Animated.View>
                </View>
            </PressableScale>
        </Swipeable>
    );
}

function GenericToast({ toast, onDismiss }: { toast: ToastInstance & { type: "generic" }; onDismiss: () => void }) {
    const [isMultiline, setIsMultiline] = useState(false);

    const onTextLayout = ({ nativeEvent }: { nativeEvent: TextLayoutEventData }) => {
        setIsMultiline(nativeEvent.lines.length > 1);
    };

    return (
        <ToastContainer
            onDismiss={onDismiss}
            dismissible={toast.options?.dismissible !== false}
            contentContainerStyle={[isMultiline && { paddingLeft: 16 }, toast.options?.contentContainerStyle]}
            onPress={toast.options?.onPress}
        >
            <Text variant="text-sm/semibold" onTextLayout={onTextLayout}>
                {toast.content.text}
            </Text>
        </ToastContainer>
    );
}

function CustomToast({
    toast,
    onDismiss,
}: {
    toast: ToastInstance & { type: "custom" };
    onDismiss: () => void;
}) {
    const { render: CustomComponent } = toast.content;
    const [_updateToast, _hideToast] = useToastStore(useShallow(state => [state.updateToast, state.hideToast]));

    const hideToast = useCallback(() => {
        _hideToast(toast.id);
    }, [toast.id, _hideToast]);

    const updateToast = useCallback(
        (config: Partial<Omit<ToastInstance, "id">>) => _updateToast(toast.id, config),
        [toast.id, _updateToast],
    );

    return (
        <ToastContainer
            onDismiss={onDismiss}
            dismissible={toast.options?.dismissible !== false}
            contentContainerStyle={toast.options?.contentContainerStyle}
            onPress={toast.options?.onPress}
        >
            <CustomComponent hide={hideToast} update={updateToast} />
        </ToastContainer>
    );
}

export function ToastComponent() {
    const hideToast = useToastStore(s => s.hideToast);
    const { toast } = useToast<{ toast: ToastInstance }>();

    if (toast.id == null) return null;

    const onDismiss = () => {
        toast.options?.onDismiss?.();
        hideToast(toast.id);
    };

    switch (toast.type) {
        case "generic":
            return <GenericToast toast={toast} onDismiss={onDismiss} />;
        case "custom":
            return <CustomToast toast={toast} onDismiss={onDismiss} />;
        default:
            if (__DEV__) {
                throw new Error(`Unknown toast type: ${(toast as any)?.type}`);
            }
            return null;
    }
}
