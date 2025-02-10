import { NavigationNative } from "@metro/new/common/libraries";
import { useLayoutEffect } from "react";

export const CustomPageRenderer = () => {
    const navigation = NavigationNative.useNavigation();
    const route = NavigationNative.useRoute();

    const { render: PageComponent, ...args } = route.params;

    // biome-ignore lint/correctness/useExhaustiveDependencies: This is fine
    useLayoutEffect(() => void navigation.setOptions({ ...args }), [navigation]);

    // TODO: Wrap with ErrorBoundary
    return <PageComponent />;
};
