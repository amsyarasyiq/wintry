import { useEffect } from "react";
import { NavigationNative } from "../../../metro/common";

export const CustomPageRenderer = () => {
    const navigation = NavigationNative.useNavigation();
    const route = NavigationNative.useRoute();

    const { render: PageComponent, ...args } = route.params;

    // biome-ignore lint/correctness/useExhaustiveDependencies: This is fine
    useEffect(() => void navigation.setOptions({ ...args }), [navigation]);

    // TODO: Wrap with ErrorBoundary
    return <PageComponent />;
};
