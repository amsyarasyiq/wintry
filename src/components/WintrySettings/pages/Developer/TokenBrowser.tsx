import { TableRow, TableRowGroup } from "@components/Discord";
import PageWrapper from "@components/WintrySettings/PageWrapper";
import { NavigationNative } from "@metro/common/libraries";
import { lazy } from "react";

export default function TokenBrowser() {
    const navigation = NavigationNative.useNavigation();

    return (
        <PageWrapper>
            <TableRowGroup title="Token type">
                <TableRow
                    label="Colors"
                    arrow={true}
                    onPress={() => {
                        navigation.push("WINTRY_CUSTOM_PAGE", {
                            title: "Colors",
                            render: lazy(() => import("./TokenBrowser/Colors")),
                        });
                    }}
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
