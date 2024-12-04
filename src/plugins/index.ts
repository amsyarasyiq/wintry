type WintryPlugin = {
    name: string;
    stage: StartStage;
    start: () => void;
    stop: () => void;
};

const Plugins: Array<WintryPlugin> = [];

export enum StartStage {
    Init = 0,
    FirstRender = 1,
}

export function startAllPlugins(stage: StartStage) {
    for (const plugin of Plugins) {
        if (plugin.stage === stage) {
            plugin.start();
        }
    }
}
