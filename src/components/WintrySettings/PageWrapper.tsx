import { SafeAreaView } from "@components/Libraries/react-native-safe-area-context";
import type { StyleProp, ViewStyle } from "react-native";

interface PageWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    /**
     * Edges to put insets on. Defaults to ["right", "bottom", "left"]. Set to an empty array to disable insets.
     */
    edges?: Array<"top" | "right" | "bottom" | "left">;
}

// Applies padding to the page content and insets to the default edges.
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
