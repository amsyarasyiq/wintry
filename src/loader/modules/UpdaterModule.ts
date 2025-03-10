import { getModule, type LoaderModule } from "@loader";

export interface UpdateInfo {
    url: string;
    revision: string;
}

interface UpdaterModule extends LoaderModule {
    fetchBundle(url?: string, revision?: string): Promise<void>;
    checkForUpdates(): Promise<UpdateInfo>;
}

export default getModule<UpdaterModule>({
    name: "UpdaterModule",
    argumentProcessors: {
        // Make sure the arguments are always with length 2
        fetchBundle: args => [args[0], args[1]],
    },
});
