import { Text } from "@components/Discord";
import { chroma, tokens } from "@metro/common/libraries";
import { createContext, useCallback, useContext, useMemo, type ComponentProps } from "react";

interface HighlightContextType<T> {
    result: Fuzzysort.KeysResult<T>;
    searchTerms: Array<(v: T) => string>;
}

const HighlightContext = createContext<HighlightContextType<any> | null>(null);

export function HighlightProvider<T>({
    children,
    result,
    searchTerms,
}: {
    children: React.ReactNode;
    result: Fuzzysort.KeysResult<T>;
    searchTerms: Array<(v: T) => string>;
}) {
    const contextValue = useMemo(() => ({ result, searchTerms }), [result, searchTerms]);

    return <HighlightContext.Provider value={contextValue}>{children}</HighlightContext.Provider>;
}

export function useHighlight() {
    const context = useContext(HighlightContext);
    if (!context) {
        throw new Error("useHighlight must be used within a HighlightProvider");
    }
    return context;
}

export function useHighlightedSearchTerm(index: number) {
    const { result, searchTerms } = useHighlight();

    return useCallback(
        (textProps: ComponentProps<typeof Text>) => {
            const highlightedNode =
                result[index]?.highlight?.((m, i) => (
                    <Text
                        key={i}
                        {...textProps}
                        style={[
                            textProps.style,
                            {
                                backgroundColor: chroma(tokens.unsafe_rawColors.YELLOW_300).alpha(0.3).hex(),
                            },
                        ]}
                    >
                        {m}
                    </Text>
                )) || [];

            return (
                <Text {...textProps}>
                    {highlightedNode.length > 0 ? highlightedNode : searchTerms[index](result.obj)}
                </Text>
            );
        },
        [result, searchTerms, index],
    );
}
