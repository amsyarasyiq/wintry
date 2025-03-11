import { showToast, type CustomToastProps } from "@api/toasts";
import { RowButton, Text } from "@components/Discord";
import PageWrapper from "@components/WintrySettings/PageWrapper";
import { useEffect, useState, type ReactNode } from "react";
import { View } from "react-native";

function DemoToastComponent(props: CustomToastProps): ReactNode {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <View style={{ gap: 8, paddingHorizontal: 12 }}>
            <Text variant="text-md/semibold">{count} second(s) has passed</Text>
            {count >= 3 && <Text variant="display-md">Gaboo!</Text>}
        </View>
    );
}

export default function ToastPlayground() {
    return (
        <PageWrapper containerStyle={{ gap: 8, padding: 8, justifyContent: "flex-end" }}>
            <RowButton
                label="Show generic toast"
                onPress={() => {
                    showToast({
                        id: "generic-toast-demo",
                        text: "This is a generic toast!",
                    });
                }}
            />
            <RowButton
                label="Show generic toast with icons"
                onPress={() => {
                    showToast({
                        id: "generic-toast-with-icons-demo",
                        icon: require("@assets/ic_wintry.png"),
                        text: "This is a generic toast, with an icon!",
                    });
                }}
            />
            <RowButton
                label="Show undissmissible toast"
                onPress={() => {
                    showToast({
                        id: "undissmissible-toast-demo",
                        text: "This is an undissmissible toast!",
                        dismissible: false,
                    });
                }}
            />
            <RowButton
                label="Show longer generic toast"
                onPress={() => {
                    showToast({
                        id: "longer-generic-toast-demo",
                        text: "This is a generic toast with a longer message! It should wrap to multiple lines.",
                    });
                }}
            />
            <RowButton
                label="Show custom toast"
                onPress={() => {
                    const toast = showToast({
                        id: "custom-toast-demo",
                        render: DemoToastComponent,
                        duration: 8000,
                        onPress: () => toast.hide(),
                    });
                }}
            />
        </PageWrapper>
    );
}
