import type { OptionDefinition } from "@plugins/types";
import { findAssetId } from "@api/assets";
import { TableRow } from "@components/Discord";

export function getIcon(icon: OptionDefinition["icon"]): JSX.Element | undefined {
    if (!icon) return;

    const source = typeof icon === "string" ? findAssetId(icon) : icon;
    return <TableRow.Icon source={source} />;
}
