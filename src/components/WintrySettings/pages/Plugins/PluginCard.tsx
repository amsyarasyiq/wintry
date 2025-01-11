import { omit } from "es-toolkit";
import type {} from "fuzzysort";
import { type ComponentProps, createContext, useContext } from "react";
import { View } from "react-native";
import { useShallow } from "zustand/shallow";
import { findAssetId, findByProps } from "../../../../metro";
import { Card, FormSwitch, IconButton, Stack, Text, tokens } from "../../../../metro/common";
import type { WintryPluginInstance } from "../../../../plugins/types";
import usePluginStore from "../../../../stores/usePluginStore";

const PluginCardContext = createContext<{
    plugin: WintryPluginInstance;
    result: Fuzzysort.KeysResult<WintryPluginInstance>;
}>(null!);

export interface PluginCardProps<T> {
    item: T;
    result: Fuzzysort.KeysResult<T>;
}

const useCardContext = () => useContext(PluginCardContext);

function getHighlightColor(): import("react-native").ColorValue {
    return findByProps("brewer")(tokens.unsafe_rawColors.YELLOW_300).alpha(0.3).hex();
}

function usePluginSettings() {
    const {
        plugin: { id },
    } = useCardContext();
    return usePluginStore(useShallow(state => state.settings[id]));
}

function SearchHighlightText(props: { index: number; fallback: string } & ComponentProps<typeof Text>) {
    const { result } = useCardContext();
    const textProps = omit(props, ["index", "fallback"]);

    // TODO: Derive style props
    const highlightedNode = result[props.index].highlight((m, i) => (
        <Text key={i} {...textProps} style={[{ backgroundColor: getHighlightColor() }]}>
            {m}
        </Text>
    ));

    return <Text {...textProps}>{highlightedNode.length > 0 ? highlightedNode : props.fallback}</Text>;
}

function Title() {
    const { plugin, result } = useCardContext();

    // could be empty if the plugin name is irrelevant!
    const highlightedNode = result[0].highlight((m, i) => (
        <Text key={i} style={{ backgroundColor: getHighlightColor() }}>
            {m}
        </Text>
    ));

    // const icon = plugin.icon && findAssetId(plugin.icon);

    const textNode = (
        <Text variant="heading-lg/semibold">{highlightedNode.length ? highlightedNode : plugin.name}</Text>
    );

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {/* {icon && <Image style={styles.smallIcon} source={icon} />} */}
            {textNode}
        </View>
    );
}

function Authors() {
    const {
        plugin: { authors },
    } = useCardContext();
    if (!authors) return null;

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", flexShrink: 1, gap: 4 }}>
            <Text variant="text-sm/semibold" color="text-muted">
                by{" "}
                {
                    <SearchHighlightText
                        index={2}
                        fallback={authors.map(a => a.name).join(", ")}
                        variant="text-sm/semibold"
                        color="text-muted"
                    />
                }
            </Text>
        </View>
    );
}

function Description() {
    const { plugin } = useCardContext();
    return <SearchHighlightText index={1} fallback={plugin.description} />;
}

function Actions() {
    return (
        <View style={{ flexDirection: "row", gap: 6 }}>
            {/* <IconButton
                size="sm"
                variant="secondary"
                icon={findAssetId("WrenchIcon")}
                disabled={!plugin.getPluginSettingsComponent()}
                onPress={() =>
                    navigation.push("WINTRY_CUSTOM_PAGE", {
                        title: plugin.name,
                        render: plugin.getPluginSettingsComponent(),
                    })
                }
            /> */}
            <IconButton
                size="sm"
                variant="secondary"
                icon={findAssetId("CircleInformationIcon-primary")}
                onPress={
                    () => {}
                    // void showSheet("PluginInfoActionSheet", plugin.resolveSheetComponent(), { plugin, navigation })
                }
            />
        </View>
    );
}

function Switch() {
    const { plugin } = useCardContext();
    const settings = usePluginSettings();
    const togglePlugin = usePluginStore(state => state.togglePlugin);

    return (
        <View style={{ opacity: plugin.required ? 0.7 : 1 }}>
            <FormSwitch
                value={settings.enabled}
                disabled={plugin.required}
                onValueChange={(v: boolean) => {
                    if (settings.enabled && plugin.onStopRequest) {
                        const manualHandle = plugin.onStopRequest(() => togglePlugin(plugin.id, false));
                        if (manualHandle === true) return;
                    }

                    if (v && plugin.requiresRestart?.(plugin.state)) {
                        // TODO: Use a proper alert
                        alert("This plugin requires a restart to be enabled.");
                        togglePlugin(plugin.id, v, false);
                    } else {
                        togglePlugin(plugin.id, v);
                    }
                }}
            />
        </View>
    );
}

export default function PluginCard({ result, item: plugin }: PluginCardProps<WintryPluginInstance>) {
    return (
        <PluginCardContext.Provider value={{ plugin, result }}>
            <Card>
                <Stack spacing={16}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ flexShrink: 1 }}>
                            <Title />
                            <Authors />
                        </View>
                        <View>
                            <Stack spacing={12} direction="horizontal">
                                <Actions />
                                <Switch />
                            </Stack>
                        </View>
                    </View>
                    <Description />
                </Stack>
            </Card>
        </PluginCardContext.Provider>
    );
}
