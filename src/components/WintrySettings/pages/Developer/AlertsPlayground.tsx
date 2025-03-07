import { dismissAlert, showAlert } from "@api/alerts";
import { Card, RowButton, Stack, Text } from "@components/Discord";
import { AlertActionButton, AlertModal, useDismissModalCallback } from "@components/Discord/AlertModal/AlertModal";
import { InlineCheckbox } from "@components/WintrySettings/InlineCheckbox";
import PageWrapper from "@components/WintrySettings/PageWrapper";
import { delay } from "es-toolkit";
import { useEffect, useState } from "react";
import { View } from "react-native";

function DemoAlert() {
    const [understood, setUnderstood] = useState(false);
    const dismissModal = useDismissModalCallback();

    return (
        <AlertModal
            title="Alert System Demo"
            content="This is an interactive demonstration of the alert system component. You can test various actions and behaviors using the buttons below."
            extraContent={
                <Stack spacing={12}>
                    <Card>
                        <Text variant="text-md/medium">
                            The alert modal supports additional content sections for complex interactions and
                            information displays.
                        </Text>
                    </Card>
                    <InlineCheckbox label="Understood" checked={understood} onPress={setUnderstood} />
                </Stack>
            }
            actions={[
                <AlertActionButton
                    key="async"
                    text="Async Action"
                    onPress={async () => {
                        await delay(1000);
                        dismissModal();
                    }}
                />,
                <AlertActionButton
                    key="dismiss"
                    text="Dismiss Alert"
                    variant="destructive"
                    onPress={() => {
                        dismissModal();
                    }}
                />,
            ]}
        />
    );
}

function CountdownDemoAlert() {
    const [count, setCount] = useState(0);
    const dismissModal = useDismissModalCallback();

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AlertModal
            title="Countdown Alert"
            content={`The button below will be enabled in ${Math.max(0, 5 - count)} seconds.`}
            actions={[
                <AlertActionButton
                    key="dismiss"
                    text="Dismiss Alert"
                    variant="destructive"
                    disabled={count < 5}
                    onPress={() => {
                        dismissModal();
                    }}
                />,
            ]}
        />
    );
}

export default function AlertsPlayground() {
    return (
        <PageWrapper containerStyle={{ gap: 12 }}>
            <View style={{ height: "60%" }} />
            <RowButton
                label="Show alert"
                onPress={() => {
                    showAlert(DemoAlert);
                }}
            />
            <RowButton
                label="Show non-dismissable alert"
                onPress={() => {
                    showAlert({
                        Component: DemoAlert,
                        dismissable: false,
                    });
                }}
            />
            <RowButton
                label="Show countdown alert"
                onPress={() => {
                    showAlert({
                        Component: CountdownDemoAlert,
                        dismissable: false,
                    });
                }}
            />
            <RowButton
                label="Show direct content alert"
                onPress={() => {
                    showAlert({
                        key: "direct-content-demo",
                        content: {
                            title: "Direct Content Alert",
                            content: "This alert uses direct content instead of a component.",
                            actions: [
                                {
                                    text: "Dismiss Alert",
                                    variant: "destructive",
                                    onPress: () => dismissAlert("direct-content-demo"),
                                },
                            ],
                        },
                    });
                }}
            />
        </PageWrapper>
    );
}
