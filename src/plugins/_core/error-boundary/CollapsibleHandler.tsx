import Button from "@components/Discord/Button/Button";
import { t } from "@i18n";
import { findAssetId } from "@api/assets";
import { tokens, useToken } from "@metro/common/libraries/Discord";
import { Image, View } from "react-native";

export function CollapsibleHandler({
    collapsed,
    setCollapsed,
    onCopy,
}: {
    collapsed: boolean;
    setCollapsed: (cb: (v: boolean) => boolean) => void;
    onCopy: () => void;
}) {
    const logoPrimary = useToken(tokens.colors.LOGO_PRIMARY);

    return (
        <View style={{ gap: 8, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            <Button
                variant="secondary"
                text={collapsed ? t.error_boundary.screen.show_more() : t.error_boundary.screen.show_less()}
                icon={
                    <Image
                        resizeMode="contain"
                        source={findAssetId("down_arrow")!}
                        style={{
                            width: 16,
                            tintColor: logoPrimary,
                            transform: [{ rotate: `${collapsed ? 0 : 180}deg` }],
                        }}
                    />
                }
                onPress={() => setCollapsed(v => !v)}
            />
            <Button
                variant="secondary"
                text={t.error_boundary.screen.copy()}
                icon={
                    <Image
                        resizeMode="contain"
                        style={{ tintColor: logoPrimary, width: 16 }}
                        source={findAssetId("CopyIcon")!}
                    />
                }
                onPress={onCopy}
            />
        </View>
    );
}
