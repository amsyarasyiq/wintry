import { Image, View, type ViewStyle } from "react-native";
import { findAssetId } from "../metro/assets";
import { useState } from "react";
import { TextInput } from "../metro/common/components";
import { t } from "../i18n";

export interface SearchProps {
    onChangeText?: (v: string) => void;
    placeholder?: string;
    style?: ViewStyle;
    isRound?: boolean;
}

function SearchIcon() {
    return <Image style={{ width: 16, height: 16 }} source={findAssetId("search")} />;
}

export default ({ onChangeText, placeholder, style, isRound }: SearchProps) => {
    const [query, setQuery] = useState("");

    const onChange = (value: string) => {
        setQuery(value);
        onChangeText?.(value);
    };

    return <View style={style}>
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
    </View>;
};