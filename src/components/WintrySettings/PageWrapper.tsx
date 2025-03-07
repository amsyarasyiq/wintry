import { SafeAreaView, useSafeAreaInsets } from "@components/Libraries/react-native-safe-area-context";
import { ScrollView, View, type StyleProp, type ViewStyle } from "react-native";

interface PageWrapperProps {
    children: React.ReactNode;

    containerStyle?: StyleProp<ViewStyle>;

    /**
     * Wraps the content in a ScrollView.
     * @default false
     */
    scrollable?: boolean;

    /**
     * Edges to put insets on. Defaults to ["right", "bottom", "left"]. Set to an empty array to disable insets.
     */
    edges?: Array<"top" | "right" | "bottom" | "left">;
}

// Applies padding to the page content and insets to the default edges and apply some default page styles.
export default function PageWrapper(props: PageWrapperProps) {
    const { height } = useSafeAreaInsets();
    const containerStyle = [{ paddingTop: 8, paddingHorizontal: 12 }, props.containerStyle];

    let node = props.children;

    if (props.scrollable) {
        node = <ScrollView contentContainerStyle={containerStyle}>{node}</ScrollView>;
    } else {
        node = <View style={[{ flex: 1, maxHeight: height }, containerStyle]}>{node}</View>;
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={props.edges ?? ["right", "bottom", "left"]}>
            {node}
        </SafeAreaView>
    );
}
