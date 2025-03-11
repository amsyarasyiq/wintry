import { TableRow } from "@components/Discord";
import PageWrapper from "@components/Wintry/Settings/PageWrapper";
import { tokens, useToken } from "@metro/common/libraries";
import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

function ColorRow({ token, start, end }: { token: string; start: boolean; end: boolean }) {
    const color = useToken(tokens.colors[token]);
    return (
        <TableRow
            label={token}
            start={start}
            end={end}
            trailing={
                <View
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: color,
                    }}
                />
            }
        />
    );
}

export default function Colors() {
    return (
        <PageWrapper containerStyle={{ paddingHorizontal: 0 }}>
            <FlashList
                data={Object.keys(tokens.colors)}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item, index }) => (
                    <ColorRow token={item} start={index === 0} end={index === Object.keys(tokens.colors).length - 1} />
                )}
                keyExtractor={item => item}
            />
        </PageWrapper>
    );
}
