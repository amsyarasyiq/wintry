import type { Toast, ToastController } from "@api/toasts";
import { Text } from "@components/Discord";
import { useToastStore } from "@stores/useToastStore";
import { isValidElement, useState } from "react";
import { Image, View, type TextLayoutEventData } from "react-native";
import { useShallow } from "zustand/shallow";

function ToastIcon({ icon }: { icon: Toast["icon"] }) {
    if (!icon) {
        return null;
    }

    if (typeof icon === "number" || (typeof icon === "object" && "uri" in icon)) {
        return <Image style={{ width: 18, height: 18 }} resizeMode="contain" source={icon} />;
    }

    if (isValidElement(icon) && typeof icon.type === "object") {
        return icon;
    }

    const Icon = icon as React.ComponentType;
    return <Icon />;
}

function GenericToast({ toast }: { toast: Toast }) {
    const [text, icon] = toast.use(useShallow(t => [t.text, t.icon]));
    const [isMultiline, setIsMultiline] = useState(false);

    const onTextLayout = ({ nativeEvent }: { nativeEvent: TextLayoutEventData }) => {
        setIsMultiline(nativeEvent.lines.length > 1);
    };

    return (
        <View style={[isMultiline && { paddingHorizontal: 12 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {icon && <ToastIcon icon={icon} />}
                <Text variant="text-sm/semibold" onTextLayout={onTextLayout}>
                    {text}
                </Text>
            </View>
        </View>
    );
}

function CustomToast({ toast }: { toast: Toast }) {
    const CustomComponent = toast.use(t => t.render!);
    const { updateToast, hideToast } = useToastStore(
        useShallow(state => ({
            updateToast: state.updateToast,
            hideToast: state.hideToast,
        })),
    );

    const controller: ToastController = {
        hide: () => {
            hideToast(toast.id);
            return controller;
        },
        update: config => {
            updateToast({ ...config, id: toast.id });
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
