import type { ToastInstance } from "@api/toasts";
import { Text } from "@components/Discord";
import { useToastStore } from "@stores/useToastStore";
import { useCallback, useState, type PropsWithChildren } from "react";
import { View, type StyleProp, type TextLayoutEventData, type ViewStyle } from "react-native";
import { useShallow } from "zustand/shallow";

function ToastContainer({
    children,
}: PropsWithChildren<{
    contentContainerStyle?: StyleProp<ViewStyle>;
    dismissible: boolean;
    onDismiss: () => void;
    onPress?: () => void;
}>) {
    return <View>{children}</View>;
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

export function ToastComponent({ toast }: { toast: ToastInstance }) {
    const hideToast = useToastStore(s => s.hideToast);

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
