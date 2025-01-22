declare module "*.png" {
    const value: string;
    export default value;
}

declare module "#build-info" {
    export const commitHash: string;
    export const branch: string;
}

declare module "#plugin-context" {
    export const meta: {
        id: string;
    };

    import * as _default from "#plugin-context";
    export default _default;

}