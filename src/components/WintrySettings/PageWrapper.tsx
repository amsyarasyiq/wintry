import type { ViewStyle } from "react-native";
import { SafeAreaView } from "../../metro/common";

interface PageWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    /**
     * Edges to put insets on. Defaults to ["right", "bottom", "left"]. Set to an empty array to disable insets.
     */
    edges?: Array<"top" | "right" | "bottom" | "left">;
}

export default function PageWrapper(props: PageWrapperProps) {
    return (
        <SafeAreaView
            style={[{ flex: 1, paddingTop: 8, paddingHorizontal: 12 }, props.style]}
            edges={props.edges ?? ["right", "bottom", "left"]}
        >
            {props.children}
        </SafeAreaView>
    );
}
