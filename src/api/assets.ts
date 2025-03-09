import { AssetsRegistry } from "../metro/common/libraries";
import { moduleRegistry } from "@metro/internal/registry";

export type Asset = { id: number } & {
    fileSystemLocation?: string;
    httpServerLocation?: string;
    width?: number;
    height?: number;
    scales: Array<number>;
    hash: string;
    name: string;
    type: string;

    resolver?: "android" | "generic";
};

const _nameToAssetCache = {} as Record<string, Asset>;
let arrayCache: Asset[] | undefined;

export function getAssets() {
    return (arrayCache ??= Array.from(iterateAssets()));
}

export function* iterateAssets() {
    const yielded = new Set<number>();

    for (const state of moduleRegistry.values()) {
        if (state.meta.isAsset) {
            const assetId = window.__r(state.id);
            if (yielded.has(state.id) || typeof assetId !== "number") {
                continue;
            }

            yield getAssetById(assetId);
            yielded.add(state.id);
        }
    }
}

// Apply additional properties for convenience
function getAssetById(id: number): Asset {
    const asset = AssetsRegistry.getAssetByID(id);
    if (!asset) return asset;
    return Object.assign(asset, { id });
}

type AssetFilter = number | string | ((a: Asset) => boolean);

/**
 * Returns the first asset registry by its registry id (number), name (string) or given filter (function)
 */
export function findAsset(id: number): Asset | undefined;
export function findAsset(name: string): Asset | undefined;
export function findAsset(filter: (a: Asset) => boolean): Asset | undefined;

export function findAsset(param: AssetFilter) {
    if (typeof param === "number") return getAssetById(param);

    if (typeof param === "string" && _nameToAssetCache[param]) {
        return _nameToAssetCache[param];
    }

    for (const asset of iterateAssets()) {
        if (typeof param === "string" && asset.name === param) {
            _nameToAssetCache[param] = asset;
            return asset;
        }
        if (typeof param === "function" && param(asset)) {
            return asset;
        }
    }
}

export function filterAssets(param: string | ((a: Asset) => boolean)) {
    const filteredAssets = [] as Array<Asset>;

    for (const asset of iterateAssets()) {
        if (typeof param === "string" ? asset.name === param : param(asset)) {
            filteredAssets.push(asset);
        }
    }

    return filteredAssets;
}

/**
 * Returns the first asset ID in the registry with the given name.
 */
export function findAssetId(name: string): number | undefined;
export function findAssetId(filter: (a: Asset) => boolean): number | undefined;

export function findAssetId(param: Exclude<AssetFilter, number>): number | undefined {
    // ANYTHING to make TypeScript happy :)
    return typeof param === "string" ? findAsset(param)?.id : findAsset(param)?.id;
}
