import { View } from "react-native";
import { Card, Text } from "../../../../metro/common/components";
import { PLUGINS } from "../../../../plugins";
import usePluginStore from "../../../../stores/usePluginStore";
import { useShallow } from "zustand/shallow";

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
    return (
        <View>
            {Object.keys(PLUGINS).map(id => (
                <PluginCard key={id} pluginId={id} />
            ))}
        </View>
    );
}
