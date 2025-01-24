import { findByProps } from "../../metro";

const actionSheet = findByProps("openLazy", "hideActionSheet");

export function showSheet<T extends React.ComponentType<any>>(
    key: string,
    lazyImport: Promise<{ default: T }> | T,
    props?: React.ComponentProps<T>,
    displayMode: "replaceAll" | "stack" = "replaceAll"
) {
    const importPromise = "then" in lazyImport ? lazyImport : Promise.resolve({ default: lazyImport });
    actionSheet.openLazy(importPromise, key, props ?? {}, displayMode);
}

export function hideSheet(key: string) {
    actionSheet.hideActionSheet(key);
}
