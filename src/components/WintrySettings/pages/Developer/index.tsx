import { lazy } from "react";
import { t } from "@i18n";
import { findAssetId } from "@metro";
import { TableRow, TableRowGroup } from "@components/Discord";
import PageWrapper from "../../PageWrapper";
import { NavigationNative } from "@metro/new/common/libraries";

export default function DeveloperPage() {
    const navigation = NavigationNative.useNavigation();

    return (
        <PageWrapper>
            <TableRowGroup title={t.settings.developer.sections.tools()}>
                <TableRow
                    arrow={true}
                    label={t.settings.developer.assetBrowser()}
                    icon={<TableRow.Icon source={findAssetId("ImageIcon")} />}
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
