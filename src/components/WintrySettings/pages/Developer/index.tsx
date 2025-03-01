import { lazy } from "react";
import { t } from "@i18n";
import { findAssetId } from "@api/assets";
import { TableRow, TableRowGroup } from "@components/Discord";
import PageWrapper from "../../PageWrapper";
import { NavigationNative } from "@metro/common/libraries";
import { MetroCache } from "@metro/internal/caches";

export default function DeveloperPage() {
    const navigation = NavigationNative.useNavigation();

    return (
        <PageWrapper style={{ gap: 12 }}>
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
                <TableRow
                    arrow={true}
                    label={"Toast Playground"}
                    icon={<TableRow.Icon source={findAssetId("ToastIcon")} />}
                    onPress={() =>
                        navigation.push("BUNNY_CUSTOM_PAGE", {
                            title: "Toast Playground",
                            render: lazy(() => import("./ToastPlayground")),
                        })
                    }
                />
            </TableRowGroup>
            <TableRowGroup title={t.settings.developer.sections.data()}>
                <TableRow
                    label={t.settings.developer.sections.invalidate_metro_cache()}
                    icon={<TableRow.Icon source={findAssetId("TrashIcon")} />}
                    variant="danger"
                    onPress={() => {
                        MetroCache.invalidate();
                        alert("Metro cache invalidated");
                    }}
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
