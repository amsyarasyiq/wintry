import { Card, Text } from "@components/Discord";
import UpdaterModule, { type UpdateInfo } from "@loader/modules/UpdaterModule";
import { create } from "zustand";
import { showAlert } from "@api/alerts";
import ErrorCard from "@components/ErrorCard";
import { showToast } from "@api/toasts";
import { Mutex, delay, noop, pick } from "es-toolkit";
import { t } from "@i18n";
import { wtlogger } from "@api/logger";
import { loaderPayload } from "@loader";
import { BundleUpdaterModule } from "@native";
import { createJSONStorage, persist } from "zustand/middleware";
import { kvStorage } from "@loader/kvStorage";

interface UpdaterStore {
    // Persisted
    notifyOnNewUpdate: boolean;

    isCheckingForUpdates: boolean;
    availableUpdate: null | UpdateInfo;

    checkForUpdates: () => Promise<UpdateInfo | null>;
}

const logger = wtlogger.createChild("UpdaterStore");
const _updateMutex = new Mutex();

export const useUpdaterStore = create(
    persist<UpdaterStore>(
        (set, get) => ({
            notifyOnNewUpdate: false,
            isCheckingForUpdates: false,
            availableUpdate: null,

            checkForUpdates: async () => {
                if (get().availableUpdate) {
                    return get().availableUpdate;
                }

                await _updateMutex.acquire();
                set({ isCheckingForUpdates: true });

                try {
                    const ret = await UpdaterModule.checkForUpdates();

                    set({ availableUpdate: ret });
                    return ret;
                } finally {
                    set({ isCheckingForUpdates: false });
                    _updateMutex.release();
                }
            },
        }),
        {
            name: "updater-store",
            storage: createJSONStorage(() => kvStorage),
            // @ts-expect-error - bad types
            partialize: s => pick(s, ["notifyOnNewUpdate"]),
        },
    ),
);

export async function initCheckForUpdates() {
    if (!loaderPayload.loader.initConfig.skipUpdate) {
        return; // Loader already has done this job
    }

    const { checkForUpdates, notifyOnNewUpdate } = useUpdaterStore.getState();

    try {
        const updateAvailable = await checkForUpdates();
        if (updateAvailable && notifyOnNewUpdate) {
            showUpdateAvailableToast(updateAvailable);
        }
    } catch (e) {
        logger.error`Failed to check for updates: ${e}`;
        showUpdateErrorToast(e);
    }
}

export function showUpdateAvailableToast(updateInfo: UpdateInfo) {
    showToast({
        id: "wt-update-available",
        text: t.updater.new_version(),
        duration: 8000,
        onPress: () => {
            showUpdateAvailableAlert(updateInfo);
        },
    });
}

export function showUpdateAvailableAlert(updateInfo: UpdateInfo) {
    showAlert({
        id: "wt-update-available",
        title: t.updater.update_available(),
        content: t.updater.new_version(),
        extraContent: (
            <Card>
                <Text variant="text-md/medium">{updateInfo.revision || "Unknown hash"}</Text>
            </Card>
        ),
        actions: [
            {
                text: t.updater.update_and_restart(),
                onPress: async () => {
                    try {
                        await UpdaterModule.fetchBundle(updateInfo.url, updateInfo.revision);
                        await delay(500); // Just in case
                        BundleUpdaterModule.reload();
                    } catch (e) {
                        logger.error`Failed to fetch bundle: ${e}`;
                        showUpdateErrorToast(e);
                    }
                },
            },
            {
                text: t.actions.nevermind(),
                variant: "secondary",
                onPress: () => {},
            },
        ],
    });
}

export function showAlreadyUpdatedToast() {
    showToast({
        id: "wt-already-updated",
        text: t.updater.already_latest(),
    });
}

// TODO: Show more proper
export function showUpdateErrorToast(error: unknown) {
    showToast({
        id: "wt-update-error",
        text: t.updater.failed_to_check(),
        onPress: () => {
            showUpdateErrorAlert(error);
        },
    });
}

export function showUpdateErrorAlert(error: unknown) {
    showAlert({
        id: "wt-update-error",
        title: t.updater.failed_to_check(),
        content: t.updater.error_alert(),
        extraContent: <ErrorCard header={null} showStackTrace={true} error={error} />,
        actions: [
            {
                text: t.actions.dismiss(),
                variant: "destructive",
                onPress: noop,
            },
        ],
    });
}
