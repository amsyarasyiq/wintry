import { Card, FlashList, Text } from "../../../../metro/common/components";
import { PLUGINS } from "../../../../plugins";
import usePluginStore from "../../../../stores/usePluginStore";
import { useShallow } from "zustand/shallow";
import PageWrapper from "../../PageWrapper";
import { View } from "react-native";

function usePluginSettings(id: string) {
    return usePluginStore(useShallow(state => state.settings[id]));
}

function PluginCard(props: { pluginId: string }) {
    const plugin = PLUGINS[props.pluginId];
    const togglePlugin = usePluginStore(state => state.togglePlugin);
    const settings = usePluginSettings(props.pluginId);

    return (
        <Card
            disabled={plugin.required}
            onPress={() => {
                if (settings.enabled && plugin.onStopRequest) {
                    const manualHandle = plugin.onStopRequest(() => togglePlugin(props.pluginId, false));
                    if (manualHandle === true) return;
                }

                togglePlugin(props.pluginId);
            }}
        >
            <Text>{plugin.name}</Text>
            <Text>{plugin.description}</Text>
            <Text>{settings.enabled ? "Enabled" : "Disabled"}</Text>
        </Card>
    );
}

export default function PluginsPage() {
    const pluginIds = Object.keys(PLUGINS);

    return (
        <PageWrapper style={{ gap: 6 }}>
            <FlashList
                data={Object.keys(PLUGINS)}
                renderItem={({ item: id }) => <PluginCard pluginId={id} />}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
        </PageWrapper>
    );
}
