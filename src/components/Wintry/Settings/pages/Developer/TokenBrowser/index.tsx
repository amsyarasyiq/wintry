import { TableRow, TableRowGroup } from "@components/Discord";
import PageWrapper from "@components/Wintry/Settings/PageWrapper";
import { NavigationNative } from "@metro/common/libraries";

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
                            render: require("./Colors").default,
                        });
                    }}
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
