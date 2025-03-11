import { dismissAlert, showAlert } from "@api/alerts";
import { Button, Card, RowButton, Stack, Text } from "@components/Discord";
import { AlertActionButton, AlertModal, useDismissModalCallback } from "@components/Discord/AlertModal/AlertModal";
import { InlineCheckbox } from "@components/Wintry/Settings/InlineCheckbox";
import PageWrapper from "@components/Wintry/Settings/PageWrapper";
import { delay, noop } from "es-toolkit";
import { useEffect, useState } from "react";

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
        <PageWrapper containerStyle={{ gap: 12, justifyContent: "flex-end" }}>
            <RowButton
                label="Show alert"
                onPress={() => {
                    showAlert({
                        id: "demo-alert",
                        Component: DemoAlert,
                    });
                }}
            />
            <RowButton
                label="Show non-dismissable alert"
                onPress={() => {
                    showAlert({
                        id: "non-dismissable-demo-alert",
                        Component: DemoAlert,
                        dismissable: false,
                    });
                }}
            />
            <RowButton
                label="Show countdown alert"
                onPress={() => {
                    showAlert({
                        id: "countdown-demo-alert",
                        Component: CountdownDemoAlert,
                        dismissable: false,
                    });
                }}
            />
            <RowButton
                label="Show alert with custom buttons"
                onPress={() => {
                    showAlert({
                        id: "custom-buttons-demo",
                        title: "Custom Buttons Alert",
                        content:
                            "This alert has custom buttons. The buttons below will not dismiss the alert or show a loading indicator when the 'onPress' returns a Promise, unlike AlertActionButton does.",
                        actions: [
                            <Button key="1" text="Button 1" onPress={noop} />,
                            <Button key="2" text="Button 2" onPress={noop} />,
                        ],
                    });
                }}
            />
            <RowButton
                label="Show direct content alert"
                onPress={() => {
                    showAlert({
                        id: "direct-content-demo",
                        title: "Direct Content Alert",
                        content: "This alert uses direct content instead of a component.",
                        actions: [
                            {
                                text: "Dismiss Alert",
                                variant: "destructive",
                                onPress: () => dismissAlert("direct-content-demo"),
                            },
                        ],
                    });
                }}
            />
        </PageWrapper>
    );
}
