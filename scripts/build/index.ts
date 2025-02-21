import { getEsbuildConfig } from "./esbuild-config";
import esbuild, { type BuildResult } from "esbuild";
import { args } from "../args-parser";
import { bold, greenBright, yellowBright } from "ansi-colors";
import { $ } from "bun";
import logger from "../logger";
import crypto from "node:crypto";

export interface WintryBuildContext {
    contextCreated: number;
    timeTaken?: number;
    lastBuildTime?: number;
    revision: string;

    config: esbuild.BuildOptions;
    context: esbuild.BuildContext;
    build({ silent }: { silent: boolean }): Promise<BuildResult>;
    updateRevision: () => Promise<void>;

    lastBuildConsumed: boolean;
    lastBuildResult?: esbuild.BuildResult;
    outputPath?: string;
}

interface BuildContextOptions {
    deploy?: boolean;
    minify: boolean;
}

export async function createBuildContext({
    deploy = args.deploy,
    minify,
}: BuildContextOptions): Promise<WintryBuildContext> {
    const config = await getEsbuildConfig({ deploy, minify });

    const context: WintryBuildContext = {
        contextCreated: Date.now(),
        lastBuildConsumed: true,
        config: config,
        context: await esbuild.context(config),
        revision: "N/A",
        async build({ silent = false }) {
            const result = await buildBundle(context, silent);
            return result;
        },
        async updateRevision() {
            context.revision = deploy
                ? (await $`git rev-parse HEAD`.text()).trim()
                : crypto.randomBytes(20).toString("hex");
        },
    };

    return context;
}

export let buildingContext: WintryBuildContext | undefined;

async function buildBundle(buildContext: WintryBuildContext, silent = false) {
    buildingContext = buildContext;
    if (!silent) logger(yellowBright(`Building ${bold(buildContext.config.outfile ?? "bundle")}...`));

    await buildContext.updateRevision();

    const beginTime = performance.now();
    const buildResult = await buildContext.context.rebuild();

    if (buildResult.errors.length > 0) {
        throw new Error(buildResult.errors[0].text);
    }

    const outputPath = Object.keys(buildResult.metafile?.outputs ?? {})[0];

    if (!outputPath) {
        throw new Error("No output generated");
    }

    buildContext.lastBuildTime = performance.now();
    buildContext.lastBuildConsumed = false;
    buildContext.lastBuildResult = buildResult;
    buildContext.outputPath = outputPath;
    buildContext.timeTaken = buildContext.lastBuildTime - beginTime;

    if (!silent) logger(greenBright(`Bundle built in ${bold(`${buildContext.timeTaken.toFixed(2)}ms`)}`));
    buildingContext = undefined;

    return buildResult;
}

if (import.meta.main) {
    if (args.port) {
        logger(yellowBright("Port argument is provided, but this is not a server script. Ignoring..."));
    }

    const buildContext = await createBuildContext({ minify: false });

    try {
        const result = await buildBundle(buildContext);
        console.log(`Built bundle: ${Object.keys(result.metafile?.outputs ?? {})[0]}`);
    } catch (e) {
        logger(`Build failed: ${e}`);
    } finally {
        buildContext.context.dispose();
    }

    if (args.minify) {
        const minifiedBuildContext = await createBuildContext({ minify: true });

        try {
            const result = await buildBundle(minifiedBuildContext);
            console.log(`Built minified bundle: ${Object.keys(result.metafile?.outputs ?? {})[0]}`);
        } catch (e) {
            logger(`Build failed: ${e}`);
        } finally {
            minifiedBuildContext.context.dispose();
        }
    }
}
