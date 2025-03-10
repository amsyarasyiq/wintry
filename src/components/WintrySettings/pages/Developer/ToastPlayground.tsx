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
        <PageWrapper containerStyle={{ gap: 12 }}>
            <View style={{ height: "60%" }} />
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
