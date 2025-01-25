import { lazyValue } from "@utils/lazy";
import "no-expose";

export const wintryGlobalExports = (window.__wintry_exports = lazyValue(
    () => require("!wintry_global!").default as Record<string, any>,
));

// This is cursed but hey, how else?
export function wintryGlobalObject() {
    const availableModules = Object.keys(wintryGlobalExports);

    function getNestedSubPaths(paths: string[]): string[] {
        const subPaths = new Set<string>();

        for (const path of paths) {
            const segments = path.split("/");
            if (segments.length >= 2) {
                subPaths.add(segments.slice(0, 2).join("/"));
            }
        }

        return Array.from(subPaths);
    }

    function defineLazyProperty(target: any, key: string, getter: () => any) {
        Object.defineProperty(target, key, {
            get() {
                const value = getter();
                Object.defineProperty(target, key, {
                    value,
                    writable: true,
                    configurable: true,
                });
                return value;
            },
            configurable: true,
        });
    }

    /**
     * Creates a hierarchical proxy for accessing nested module exports
     * @param baseObject - Base object to proxy
     * @param currentPath - Current path in module hierarchy
     */
    function createModuleProxy(baseObject = {} as Record<string, unknown>, currentPath = "") {
        return new Proxy(baseObject, {
            get(_, key: string) {
                if (typeof key !== "string") return baseObject[key];

                const matchingModulePaths = availableModules.filter(modulePath =>
                    modulePath.startsWith(currentPath + key),
                );

                if (matchingModulePaths.length === 0) return baseObject[key];
                if (matchingModulePaths.length === 1 && key === matchingModulePaths[0])
                    return wintryGlobalExports[currentPath + key];

                const pathPrefix = new RegExp(`^${currentPath + key}/`);
                const relativePaths = matchingModulePaths.map(path => `${key}/${path.replace(pathPrefix, "")}`);
                const immediateChildren = getNestedSubPaths(relativePaths);

                const childModules = {} as Record<string, any>;

                for (const childPath of immediateChildren) {
                    const fullChildPath = currentPath + childPath;
                    const childKey = fullChildPath.replace(pathPrefix, "");

                    defineLazyProperty(childModules, childKey, () =>
                        createModuleProxy(wintryGlobalExports[fullChildPath], `${fullChildPath}/`),
                    );
                }

                const currentModule = wintryGlobalExports[currentPath + key] ?? {};
                return new Proxy(currentModule as Record<string, any>, {
                    get(_, prop: string) {
                        // The actual module has a higher priority, but in the case when the developer wants to access the property of
                        // a child module, then we should return it instead (by prefixing it with '$$')
                        if (
                            typeof prop === "string" &&
                            prop.startsWith("$$") &&
                            currentModule[prop.slice(2)] &&
                            childModules[prop.slice(2)]
                        ) {
                            return childModules[prop.slice(2)];
                        }

                        return currentModule[prop] ?? childModules[prop];
                    },
                });
            },
        });
    }

    return createModuleProxy();
}
