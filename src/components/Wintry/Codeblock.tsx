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

import { Platform, Text, TextInput, type StyleProp, type TextStyle } from "react-native";
import { createStyles } from "../utils/styles";
import { constants, tokens } from "@metro/common/libraries";

export interface CodeblockProps {
    selectable?: boolean;
    style?: StyleProp<TextStyle>;
    children?: string;
}

const useStyles = createStyles(() => ({
    codeblock: {
        fontFamily: constants.Fonts.CODE_NORMAL,
        fontSize: 12,
        textAlignVertical: "center",
        backgroundColor: tokens.colors.BACKGROUND_SECONDARY,
        color: tokens.colors.TEXT_NORMAL,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: tokens.colors.BACKGROUND_TERTIARY,
        padding: 10,
    },
}));

// iOS doesn't support the selectable property on RN.Text...
const InputBasedCodeblock = ({ style, children }: CodeblockProps) => (
    <TextInput editable={false} multiline style={[useStyles().codeblock, style && style]} value={children} />
);

const TextBasedCodeblock = ({ selectable, style, children }: CodeblockProps) => (
    <Text selectable={selectable} style={[useStyles().codeblock, style && style]}>
        {children}
    </Text>
);

export default function Codeblock({ selectable, style, children }: CodeblockProps) {
    if (!selectable) return <TextBasedCodeblock style={style}>{children}</TextBasedCodeblock>;

    return Platform.select({
        ios: <InputBasedCodeblock style={style}>{children}</InputBasedCodeblock>,
        default: (
            <TextBasedCodeblock style={style} selectable>
                {children}
            </TextBasedCodeblock>
        ),
    });
}
