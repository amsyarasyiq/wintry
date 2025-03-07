import { Toast, type CustomToastRendererProps } from "@api/toasts";
import { RowButton, Text } from "@components/Discord";
import PageWrapper from "@components/WintrySettings/PageWrapper";
import { useEffect, useState, type ReactNode } from "react";
import { View } from "react-native";

function DemoToastComponent(props: CustomToastRendererProps): ReactNode {
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
        <View style={{ gap: 8 }}>
            <Text variant="text-md/semibold">{count} second(s) has passed</Text>
            {count >= 5 && <Text variant="display-md">Gaboo!</Text>}
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
                    const toast = new Toast({
                        content: {
                            text: "Hello, world!",
                        },
                        options: {
                            duration: 3000,
                        },
                    });

                    toast.show();
                }}
            />
            <RowButton
                label="Show custom toast"
                onPress={() => {
                    const toast = new Toast({
                        type: "custom",
                        content: {
                            render: DemoToastComponent,
                        },
                        options: {
                            duration: 8000,
                        },
                    });

                    toast.show();
                }}
            />
        </PageWrapper>
    );
}
