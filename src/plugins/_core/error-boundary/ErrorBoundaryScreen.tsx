import Codeblock from "@components/Codeblock";
import { createStyles } from "@components/utils/styles";
import { t } from "@i18n";
import { BundleUpdaterModule } from "@native";
import usePrefsStore, { isSafeModeEnabled } from "@stores/usePrefsStore";
import { hasStack, isComponentStack } from "@utils/errors/isError";
import { ScrollView, View } from "react-native";
import ErrorComponentStackCard from "./ErrorComponentStackCard";
import ErrorStackCard from "./ErrorStackCard";
import { getDebugInfo } from "@debug/info";
import Button from "@components/Discord/Button/Button";
import { Card, Text } from "@components/Discord";
import { tokens } from "@metro/common/libraries";
import { SafeAreaProvider, SafeAreaView } from "@components/Libraries/react-native-safe-area-context";

const useStyles = createStyles(() => ({
    container: {
        flex: 1,
        backgroundColor: tokens.colors.BG_BASE_SECONDARY,
        paddingHorizontal: 16,
        height: "100%",
        padding: 8,
        gap: 12,
    },
}));

interface ErrorBoundaryScreenProps {
    error: unknown;
    reset: () => void;
}

export function ErrorBoundaryScreen(props: ErrorBoundaryScreenProps) {
    const styles = useStyles();

    const debugInfo = getDebugInfo();

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={{ gap: 4 }}>
                    <Text variant="display-lg">{t.error_boundary.uh_oh()}</Text>
                    <Text variant="text-md/normal">{t.error_boundary.screen.description()}</Text>
                    <Text variant="text-sm/normal" color="text-muted">
                        {debugInfo.os.name}; {debugInfo.discord.build} ({debugInfo.discord.version});{" "}
                        {debugInfo.bunny.shortRevision}
                    </Text>
                </View>
                <ScrollView fadingEdgeLength={64} contentContainerStyle={{ gap: 12 }}>
                    <Codeblock selectable={true}>
                        {props.error instanceof Error ? props.error.message : String(props.error)}
                    </Codeblock>
                    {hasStack(props.error) && <ErrorStackCard error={props.error} />}
                    {isComponentStack(props.error) ? (
                        <ErrorComponentStackCard componentStack={props.error.componentStack} />
                    ) : null}
                </ScrollView>
                <Card style={{ gap: 6 }}>
                    <Button text={t.error_boundary.reload()} onPress={() => BundleUpdaterModule.reload()} />
                    {!isSafeModeEnabled() && (
                        <Button
                            text={t.error_boundary.safe_mode()}
                            onPress={() => {
                                usePrefsStore.setState({ safeMode: true });
                            }}
                        />
                    )}
                    <Button
                        variant="destructive"
                        text={t.error_boundary.retry_render()}
                        onPress={() => props.reset()}
                    />
                </Card>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
