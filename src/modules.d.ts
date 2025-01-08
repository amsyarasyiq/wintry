declare module "*.png" {
    const value: string;
    export default value;
}

declare module "#build-info" {
    export const commitHash: string;
    export const branch: string;
}
