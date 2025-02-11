declare module "*.png" {
    const value: string;
    export default value;
}

declare module "#build-info" {
    type BuildInfo = import("../scripts/build/plugins/build-info").BuildInfo;

    export const revision: BuildInfo["revision"];
    export const branch: BuildInfo["branch"];
    export const remote: BuildInfo["remote"];
    export const version: BuildInfo["version"];
}

declare module "#plugin-context" {
    export const {
        meta,
        definePlugin,
        definePluginSettings,
    }: ReturnType<typeof import("./plugins/shared").getPluginContext>;

    import * as _default from "#plugin-context";
    export default _default;
}
