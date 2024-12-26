import { ScrollView, type ViewStyle } from "react-native";

interface PageWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export default function PageWrapper(props: PageWrapperProps) {
    return <ScrollView 
        style={[{ flex: 1 }, props.style]} 
        contentContainerStyle={{ paddingBottom: 38, paddingVertical: 24, paddingHorizontal: 12 }}
    >
        {props.children}
    </ScrollView>
}