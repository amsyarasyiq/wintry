import { getEsbuildConfig } from "./esbuild-config";
import esbuild from "esbuild";
import { args } from "../args-parser";
import { bold, greenBright, yellowBright } from "ansi-colors";
import { $ } from "bun";
import logger from "../logger";
import crypto from "node:crypto";

export interface WintryBuildContext {
    contextCreated: number;
    timeTaken?: number;
    revision: string;

    config: esbuild.BuildOptions;
    context: esbuild.BuildContext;
    build({ silent }: { silent: boolean }): Promise<Response | undefined>;
    updateRevision: () => Promise<void>;

    lastBuildConsumed: boolean;
    lastBuildResult?: esbuild.BuildResult;
    outputPath?: string;
}

export async function getBuildContext(options = args): Promise<WintryBuildContext> {
    const config = await getEsbuildConfig({
        deploy: options.deploy,
        minify: options.minify,
    });

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
            context.revision = options.deploy
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
    buildingContext = undefined;
}

if (import.meta.main) {
    if (args.port) {
        logger(yellowBright("Port argument is provided, but this is not a server script. Ignoring..."));
    }

    const buildContext = await getBuildContext();
    buildBundle(buildContext);
    buildContext.context.dispose();
}
