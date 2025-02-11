import type { Plugin } from "esbuild";
import sizeOf from "image-size";
import path from "path";

const namespace = "asset-loader";
const METRO_COMMON_LIBRARIES = "@metro/common/libraries";
const ASSETS_REGISTRY = "AssetsRegistry";

function escapeRegex(str: string) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

async function generateAssetScript(absolutePath: string): Promise<string> {
    const fileBuffer = await Bun.file(absolutePath).arrayBuffer();
    const dimensions = sizeOf(absolutePath);
    const base64Data = Buffer.from(fileBuffer).toString("base64");

    const asset = {
        __wintry: true,
        __packager_asset: true,
        width: dimensions.width,
        height: dimensions.height,
        httpServerLocation: absolutePath,
        dataurl: `data:image/png;base64,${base64Data}`,
        scales: [1],
        name: path.basename(absolutePath),
        type: dimensions.type,
    };

    return `
        import { ${ASSETS_REGISTRY} } from "${METRO_COMMON_LIBRARIES}";
        module.exports = ${ASSETS_REGISTRY}.registerAsset(${JSON.stringify(asset)});
    `;
}

interface AssetLoaderOptions {
    extensions: string[];
}

export function assetLoaderPlugin({ extensions }: AssetLoaderOptions): Plugin {
    const filter = new RegExp(`\\.(${extensions.map(escapeRegex).join("|")})$`);

    return {
        name: namespace,
        setup(build) {
            build.onResolve({ filter }, args => {
                const filePathFromRoot = args.path.startsWith("@")
                    ? path.join("src", args.path.slice(1))
                    : path.relative(
                          ".",
                          path.resolve(path.dirname(args.importer), args.path), // Full path to asset
                      );

                return {
                    path: filePathFromRoot.replaceAll(path.sep, "/"),
                    namespace,
                };
            });

            build.onLoad({ filter, namespace }, async args => {
                return {
                    contents: await generateAssetScript(args.path),
                    loader: "js",
                    resolveDir: path.resolve("."),
                };
            });
        },
    };
}
