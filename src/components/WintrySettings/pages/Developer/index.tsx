import { TableRow, TableRowGroup } from "../../../../metro/common/components";
import { t } from "../../../../i18n";
import { NavigationNative } from "../../../../metro/common";
import { lazy } from "react";
import PageWrapper from "../../PageWrapper";

export default function DeveloperPage() {
    const navigation = NavigationNative.useNavigation();

    return (
        <PageWrapper>
            <TableRowGroup title={t.settings.developer.sections.tools()}>
                <TableRow
                    label={t.settings.developer.assetBrowser()}
                    onPress={() =>
                        navigation.push("BUNNY_CUSTOM_PAGE", {
                            title: t.settings.developer.assetBrowser(),
                            render: lazy(() => import("./AssetBrowser")),
                        })
                    }
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
