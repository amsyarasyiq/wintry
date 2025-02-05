import type { ToastInstance } from "@api/toasts";
import { createStyles } from "@components/utils/styles";
import { PressableScale, Text, tokens } from "@metro/common";
import { View } from "react-native";
import { Swipeable, useToast } from "react-native-customizable-toast" with { lazy: "on" };

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

export function ToastComponent() {
    const containerStyles = useContainerStyles();
    const { hide, ...toast } = useToast<ToastInstance>();

    if (toast.id == null) return null;
    const { type, content, options = {} } = toast;

    if (type === "generic") {
        return (
            <Swipeable onSwipe={() => options.onDismiss?.()} disabled={!options.dismissible}>
                <PressableScale style={containerStyles.container} onPress={() => content.onPress?.()}>
                    <View style={[containerStyles.contentContainer, options.contentContainerStyle]}>
                        <Text variant="text-sm/semibold">{toast.content.text}</Text>
                    </View>
                </PressableScale>
            </Swipeable>
        );
    }

    if (type === "custom") {
        const { render: CustomComponent, wrapPressable = true } = content;

        const toastContent = (
            <View style={[containerStyles.contentContainer, options.contentContainerStyle]}>
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

    if (__DEV__) {
        throw new Error(`Unknown toast type: ${type}`);
    }

    return null;
}
