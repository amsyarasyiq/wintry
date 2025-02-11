import type { Plugin } from "esbuild";
import { buildingContext } from "..";
import { $ } from "bun";

export interface BuildInfo {
    revision: string;
    branch: string;
    remote: string;
    version: string;
}

async function getRepository() {
    const out = await $`git remote get-url origin`.text();
    return out.trim().replace("https://github.com/", "").replace("git@github.com:", "").replace(/.git$/, "");
}

async function getBuildInfo(): Promise<BuildInfo> {
    const buildInfo: BuildInfo = {
        revision: buildingContext!.revision,
        branch: (await $`git branch --show-current`.text()).trim(),
        remote: await getRepository(),
        version: require("../../../package.json").version || "N/A",
    };

    return buildInfo;
}

export function buildInfoPlugin(): Plugin {
    return {
        name: "build-info",
        setup(build) {
            build.onResolve({ filter: /^#build-info$/ }, args => {
                return { path: args.path, namespace: "build-info" };
            });

            build.onLoad({ filter: /^#build-info$/, namespace: "build-info" }, async () => {
                return {
                    contents: JSON.stringify(await getBuildInfo()),
                    loader: "json",
                };
            });
        },
    };
}
