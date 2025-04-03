import { View } from "react-native";
import { findAssetId } from "@api/assets";
import IconButton from "@components/Discord/Button/IconButton";
import FormSwitch from "@components/Discord/Forms/FormSwitch";
import { Card, Stack, Text } from "@components/Discord";
import type { Addon, AddonPageProps } from ".";
import { useHighlightedSearchTerm } from "./SearchTermHighlight";

interface AddonCardProps<T extends Addon> {
    addon: T;
    pageProps: AddonPageProps<T>;
}

function CardHeader<T extends Addon>({ addon }: { addon: T }) {
    const HeaderText = useHighlightedSearchTerm(0);

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <HeaderText variant="heading-lg/semibold" />
        </View>
    );
}

function CardDevs<T extends Addon>({ addon }: { addon: T }) {
    if (!addon.asAddonMetadata().authors) return null;

    const DevText = useHighlightedSearchTerm(2);

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", flexShrink: 1, gap: 4 }}>
            <Text variant="text-sm/semibold" color="text-muted">
                by {<DevText variant="text-sm/semibold" color="text-muted" />}
            </Text>
        </View>
    );
}

function Description() {
    const DescriptionText = useHighlightedSearchTerm(1);
    return <DescriptionText variant="text-md/medium" color="text-secondary" />;
}

function CardActions<T extends Addon>({ addon, pageProps }: AddonCardProps<T>) {
    return (
        <View style={{ flexDirection: "row", gap: 6 }}>
            {pageProps.onPressInfo && (
                <IconButton
                    size="sm"
                    variant="secondary"
                    icon={findAssetId("CircleInformationIcon-primary")}
                    onPress={() => pageProps.onPressInfo?.(addon)}
                />
            )}
        </View>
    );
}

function CardSwitch<T extends Addon>({ addon, pageProps }: AddonCardProps<T>) {
    const canToggle = pageProps.useCanHandleAddon(addon.asAddonMetadata().id);
    const [enabled, setEnabled] = pageProps.useToggler(addon.asAddonMetadata().id);

    return (
        <View>
            <FormSwitch
                value={enabled}
                disabled={!canToggle}
                onValueChange={(v: boolean) => {
                    setEnabled(v);
                }}
            />
        </View>
    );
}

export default function AddonCard<T extends Addon>(props: AddonCardProps<T>) {
    const { pageProps, addon } = props;
    const handleable = pageProps.useCanHandleAddon(addon.asAddonMetadata().id);

    return (
        <Card
            style={{ opacity: !handleable ? 0.7 : 1 }}
            onPress={(handleable && pageProps.onPressInfo && (() => pageProps.onPressInfo!(addon))) || undefined}
        >
            <Stack spacing={8}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flexShrink: 1 }}>
                        <CardHeader addon={addon} />
                        <CardDevs addon={addon} />
                    </View>
                    <View>
                        <Stack spacing={12} direction="horizontal">
                            <CardActions addon={addon} pageProps={pageProps} />
                            <CardSwitch addon={addon} pageProps={pageProps} />
                        </Stack>
                    </View>
                </View>
                <Description />
            </Stack>
        </Card>
    );
}
