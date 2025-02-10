import { lookupByProps } from "@metro/common/wrappers";

let SheetActionCreators = lookupByProps("openLazy", "hideActionSheet").asLazy(m => (SheetActionCreators = m));

export function showSheet<T extends React.ComponentType<any>>(
    key: string,
    lazyImport: Promise<{ default: T }> | T,
    props?: React.ComponentProps<T>,
    displayMode: "replaceAll" | "stack" = "replaceAll",
) {
    const importPromise = "then" in lazyImport ? lazyImport : Promise.resolve({ default: lazyImport });
    SheetActionCreators.openLazy(importPromise, key, props ?? {}, displayMode);
}

export function hideSheet(key: string) {
    SheetActionCreators.hideActionSheet(key);
}
