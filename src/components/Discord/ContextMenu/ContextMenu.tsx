import type { LiteralUnion } from "type-fest";
import { getComponentFromProps } from "../util";

interface ContextMenuItem {
    label: string;
    variant?: LiteralUnion<"destructive", string>;
    iconSource?: number;
    action: () => unknown;
}

interface ContextMenuProps {
    triggerOnLongPress?: boolean;
    items: ContextMenuItem[] | ContextMenuItem[][];
    align?: "left" | "right" | "above" | "below" | "auto" | null;
    title?: string;
    children: React.FC<Record<"onPress" | "onLongPress" | "accessibilityActions" | "onAccessibilityAction", any>>;
}

export default getComponentFromProps<ContextMenuProps>("ContextMenu");
