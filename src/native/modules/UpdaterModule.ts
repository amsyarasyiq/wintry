import LoaderModule from "./LoaderModule";

export default new class UpdaterModule extends LoaderModule {
    constructor() {
        super("UpdaterModule");
    }

    public updateBundle() {
        return this.callFunction("updateBundle", []);
    }
}