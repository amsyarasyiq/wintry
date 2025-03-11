import { wtlogger } from "@api/logger";
import { showToast, type CustomToastProps, type ToastProps } from "@api/toasts";
import { RowButton, TableRow, TableRowGroup, TableSwitchRow, Text, TextInput } from "@components/Discord";
import PageWrapper from "@components/Wintry/WintrySettings/PageWrapper";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, View, ScrollView } from "react-native";

const logger = wtlogger.createChild("ToastPlayground");

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
    const [toastConfig, setToastConfig] = useState({
        id: "toast-demo",
        text: "This is a toast message",
        dismissible: true,
        duration: 5000,
        showIcon: false,
        updateAfterDelay: false,
    });

    const handleShowToast = () => {
        const options: Partial<ToastProps> = {
            id: JSON.stringify(toastConfig),
            text: toastConfig.text,
            dismissible: toastConfig.dismissible,
            duration: toastConfig.duration,
            onDismiss() {
                logger.info("Toast dismissed");
            },
            onPress() {
                logger.info("Toast pressed");
            },
            onTimeout() {
                logger.info("Toast timed out");
            },
        };

        if (toastConfig.showIcon) {
            options.icon = require("@assets/ic_wintry.png");
        }

        if (toastConfig.updateAfterDelay) {
            setTimeout(() => {
                toast.update({
                    text: `${toastConfig.text} (Updated)`,
                });
            }, 2000);
        }

        const toast = showToast(options as ToastProps);
    };

    return (
        <PageWrapper>
            <ScrollView contentContainerStyle={{ gap: 12 }} style={{ flex: 1 }}>
                <TableRowGroup title="Configure">
                    <TableRow
                        label={
                            <TextInput
                                label="Toast Text"
                                value={toastConfig.text}
                                onChange={text => setToastConfig(prev => ({ ...prev, text }))}
                                style={{ width: 150 }}
                            />
                        }
                    />
                    <TableRow
                        label={
                            <TextInput
                                label="Duration (ms)"
                                value={String(toastConfig.duration)}
                                onChange={text =>
                                    setToastConfig(prev => ({
                                        ...prev,
                                        duration: Number(text) || 5000,
                                    }))
                                }
                                keyboardType="numeric"
                                style={{ width: 150 }}
                            />
                        }
                    />

                    <TableSwitchRow
                        label="Show Icon"
                        value={toastConfig.showIcon}
                        onValueChange={value => setToastConfig(prev => ({ ...prev, showIcon: value }))}
                    />

                    <TableSwitchRow
                        label="Dismissible"
                        value={toastConfig.dismissible}
                        onValueChange={value => setToastConfig(prev => ({ ...prev, dismissible: value }))}
                    />

                    <TableSwitchRow
                        label="Update After Delay"
                        value={toastConfig.updateAfterDelay}
                        onValueChange={value => setToastConfig(prev => ({ ...prev, updateAfterDelay: value }))}
                    />
                </TableRowGroup>

                <RowButton label="Show Configured Toast" onPress={handleShowToast} />
                <RowButton
                    label="Show Custom Component Toast"
                    onPress={() => {
                        const toast = showToast({
                            id: "custom-toast",
                            render: DemoToastComponent,
                            onPress: () => toast.hide(),
                            duration: toastConfig.duration,
                            dismissible: toastConfig.dismissible,
                        });
                    }}
                />
                <RowButton
                    label="Loading Toast"
                    onPress={() => {
                        const toast = showToast({
                            id: "loading-toast",
                            text: "Loading...",
                            icon: <ActivityIndicator />,
                            dismissible: false,
                        });

                        setTimeout(() => {
                            toast.update({
                                text: "Loading complete!",
                                icon: undefined,
                                dismissible: true,
                            });
                        }, 2000);
                    }}
                />
            </ScrollView>
        </PageWrapper>
    );
}
