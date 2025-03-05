import LoaderModule from "./LoaderModule";

export interface UpdateInfo {
    url: string;
    hash?: string;
}

export default new (class UpdaterModule extends LoaderModule {
    constructor() {
        super("UpdaterModule");
    }

    public updateBundle() {
        return this.callFunction("updateBundle", []);
    }

    public checkForUpdates(): Promise<UpdateInfo> {
        return this.callFunction("checkForUpdates", []);
    }
})();
