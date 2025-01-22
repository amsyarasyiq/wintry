import type { LiteralUnion } from "type-fest";

type KeyOfOrAny<P, T extends object> = P extends keyof T ? T[P] : any;

/**
 * Hooks into the definition of a property on an object, allowing a callback to be executed
 * whenever the property is set. If the property already exists on the target object, the
 * callback is immediately invoked with the current value of the property.
 *
 * @param target - The target object on which to define the property.
 * @param property - The property key to hook into.
 * @param cb - The callback function to execute
 * whenever the property is set. The callback receives the new value of the property and
 * should return the value to be set.
 *
 * @returns A function that, when called, removes the hooked property and restores its original value.
 * Only defined if the property was not already present on the target object.
 */
export default function hookDefineProperty<T extends object, P extends LiteralUnion<keyof T, PropertyKey>>(
    target: T,
    property: LiteralUnion<keyof T, PropertyKey>,
    cb: (val: KeyOfOrAny<P, T>) => KeyOfOrAny<P, T>,
) {
    const targetAsAny = target as any;

    if (property in target) {
        return void cb(targetAsAny[property]);
    }

    let value: any;

    Object.defineProperty(targetAsAny, property, {
        get: () => value,
        set(v) {
            value = cb(v) ?? v;
        },
        configurable: true,
        enumerable: false,
    });

    return () => {
        delete targetAsAny[property];
        targetAsAny[property] = value;
    };
}

// Based on https://github.com/bunny-mod/Bunny/blob/main/src/lib/utils/findInTree.ts

export type SearchTree = Record<string, any>;
export type SearchFilter = (tree: SearchTree) => boolean;
export interface FindInTreeOptions {
    walkable?: string[];
    ignore?: string[];
    maxDepth?: number;
}

function treeSearch(tree: SearchTree, filter: SearchFilter, opts: Required<FindInTreeOptions>, depth: number): any {
    if (depth > opts.maxDepth) return;
    if (!tree) return;

    try {
        if (filter(tree)) return tree;
    } catch { }

    if (Array.isArray(tree)) {
        for (const item of tree) {
            if (typeof item !== "object" || item === null) continue;

            try {
                const found = treeSearch(item, filter, opts, depth + 1);
                if (found) return found;
            } catch { }
        }
    } else if (typeof tree === "object") {
        for (const key of Object.keys(tree)) {
            if (typeof tree[key] !== "object" || tree[key] === null) continue;
            if (opts.walkable.length && !opts.walkable.includes(key)) continue;
            if (opts.ignore.includes(key)) continue;

            try {
                const found = treeSearch(tree[key], filter, opts, depth + 1);
                if (found) return found;
            } catch { }
        }
    }
}

export function findInTree(
    tree: SearchTree,
    filter: SearchFilter,
    { walkable = [], ignore = [], maxDepth = 100 }: FindInTreeOptions = {},
): any | undefined {
    return treeSearch(tree, filter, { walkable, ignore, maxDepth }, 0);
}

export function findInReactTree(tree: { [key: string]: any }, filter: SearchFilter): any {
    return findInTree(tree, filter, {
        walkable: ["props", "children", "child", "sibling"],
    });
}
