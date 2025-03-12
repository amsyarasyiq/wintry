/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2023, Team Vendetta
 * Copyright (c) 2024, pylixonly
 * Copyright (c) 2025, Wintry and contributors
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
