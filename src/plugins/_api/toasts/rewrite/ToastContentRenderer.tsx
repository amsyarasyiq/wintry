import type { Toast } from "@api/toasts";
import { TableRow, Text } from "@components/Discord";
import { useToastStore } from "@stores/useToastStore";
import { isValidElement, useState } from "react";
import { View, type TextLayoutEventData } from "react-native";
import { useShallow } from "zustand/shallow";

function ToastIcon({ icon }: { icon: Toast["icon"] }) {
    if (!icon) {
        return null;
    }

    if (typeof icon === "number" || (typeof icon === "object" && "uri" in icon)) {
        return <TableRow.Icon source={icon} />;
    }

    if (isValidElement(icon)) {
        return icon;
    }

    const Icon = icon as React.ComponentType;
    return <Icon />;
}

function GenericToast({ toast }: { toast: Toast }) {
    const [isMultiline, setIsMultiline] = useState(false);

    const onTextLayout = ({ nativeEvent }: { nativeEvent: TextLayoutEventData }) => {
        setIsMultiline(nativeEvent.lines.length > 1);
    };

    return (
        <View style={[isMultiline && { paddingHorizontal: 12 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {toast.icon && <ToastIcon icon={toast.icon} />}
                <Text variant="text-sm/semibold" onTextLayout={onTextLayout}>
                    {toast.text}
                </Text>
            </View>
        </View>
    );
}

function CustomToast({ toast }: { toast: Toast }) {
    const CustomComponent = toast.render!;
    const { getToast, showToast, updateToast, hideToast } = useToastStore(
        useShallow(state => ({
            getToast: state.getToast,
            showToast: state.showToast,
            updateToast: state.updateToast,
            hideToast: state.hideToast,
        })),
    );

    const controller = {
        show: () => {
            showToast(getToast(toast.id) ?? toast);
            return controller;
        },
        hide: () => {
            hideToast(toast.id);
            return controller;
        },
        update: (config: Partial<Toast>) => {
            updateToast(toast.id, config);
            return controller;
        },
    };

    return <CustomComponent controller={controller} />;
}

export function ToastContentRenderer({ toast }: { toast: Toast }) {
    if ("text" in toast) {
        return <GenericToast toast={toast} />;
    }

    if ("render" in toast && toast.render) {
        return <CustomToast toast={toast} />;
    }

    throw new Error("Invalid toast type");
}
