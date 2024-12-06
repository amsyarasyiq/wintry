import { ReactNative } from "../../../metro/common";
import { Text } from "../../../metro/common/components";

import WintryIcon from "./wintry.png";

export default function SettingsPage() {
    const { Image, View } = ReactNative;

    return (
        <View style={{ flex: 1, gap: 16, justifyContent: "center", alignItems: "center" }}>
            <Image source={{ height: 48, width: 48, uri: WintryIcon }} />
            <Text variant="display-lg">Wintry</Text>
        </View>
    );
}
