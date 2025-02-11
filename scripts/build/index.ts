import { getEsbuildConfig } from "./esbuild-config";
import esbuild from "esbuild";
import { args } from "../args-parser";
import { bold, greenBright, yellowBright } from "ansi-colors";
import { $ } from "bun";
import logger from "../logger";

export interface WintryBuildContext {
    contextCreated: number;
    timeTaken?: number;
    revision?: string;

    config: esbuild.BuildOptions;
    context: esbuild.BuildContext;
    build({ silent }: { silent: boolean }): Promise<Response | undefined>;

    lastBuildConsumed: boolean;
    lastBuildResult?: esbuild.BuildResult;
    outputPath?: string;
}

export async function getBuildContext(options = args): Promise<WintryBuildContext> {
    const config = await getEsbuildConfig({
        deploy: options.deploy,
        minify: options.minify,
    });

    return {
        contextCreated: Date.now(),
        lastBuildConsumed: true,
        config: config,
        context: await esbuild.context(config),
        revision: (await $`git rev-parse HEAD`.text()).trim(),
        async build({ silent = false }) {
            const result = await buildBundle(this, silent);
            return result;
        },
    };
}

async function buildBundle(buildContext: WintryBuildContext, silent = false) {
    if (!silent) logger(yellowBright(`Building ${bold(buildContext.config.outfile ?? "bundle")}...`));

    const beginTime = performance.now();
    const buildResult = await buildContext.context.rebuild();

    if (buildResult.errors.length > 0) {
        return new Response(`Build failed: ${buildResult.errors[0].text}`, { status: 500 });
    }

    const outputPath = Object.keys(buildResult.metafile?.outputs ?? {})[0];

    if (!outputPath) {
        return new Response("Build failed: No output generated", { status: 500 });
    }

    buildContext.lastBuildConsumed = false;
    buildContext.lastBuildResult = buildResult;
    buildContext.outputPath = outputPath;
    buildContext.timeTaken = performance.now() - beginTime;

    if (!silent) logger(greenBright(`Bundle built in ${bold(`${buildContext.timeTaken.toFixed(2)}ms`)}`));
}

if (import.meta.main) {
    if (args.port) {
        logger(yellowBright("Port argument is provided, but this is not a server script. Ignoring..."));
    }

    const buildContext = await getBuildContext();
    buildBundle(buildContext);
    buildContext.context.dispose();
}
