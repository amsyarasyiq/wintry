import { useState } from "react";
import { Image, View, type StyleProp, type ViewStyle } from "react-native";
import { t } from "@i18n";
import { findAssetId } from "@api/assets";
import TextInput from "../Discord/TextInput/TextInput";

export interface SearchProps {
    queryRef?: ReturnType<typeof useSearchQuery>;
    onChangeText?: (v: string) => void;
    placeholder?: string;
    style?: StyleProp<ViewStyle>;
    isRound?: boolean;
}

function SearchIcon() {
    return <Image style={{ width: 16, height: 16 }} source={findAssetId("search")} />;
}

type SearchQueryRef = { query: string; __set: (value: string) => void };

export function useSearchQuery(): SearchQueryRef {
    const [q, setQ] = useState("");
    const ref = { query: q, __set: setQ };

    return ref;
}

export default ({ onChangeText, placeholder, style, isRound, queryRef }: SearchProps) => {
    const [query, setQuery] = useState(queryRef?.query ?? "");

    const onChange = (value: string) => {
        setQuery(value);
        onChangeText?.(value);
        queryRef?.__set(value);
    };

    return (
        <View style={style}>
            <TextInput
                grow={true}
                isClearable={true}
                leadingIcon={SearchIcon}
                placeholder={placeholder ?? t.ui.components.search.placeholder()}
                onChange={onChange}
                returnKeyType="search"
                size="md"
                autoCapitalize="none"
                autoCorrect={false}
                isRound={isRound}
                value={query}
            />
        </View>
    );
};
