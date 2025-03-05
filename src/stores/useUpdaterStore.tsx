import { Card, Text } from "@components/Discord";
import UpdaterModule, { type UpdateInfo } from "@native/modules/UpdaterModule";
import { create } from "zustand";
import { showAlert } from "@api/alerts";
import ErrorCard from "@components/ErrorCard";
import { showToast } from "@api/toasts";
import { Mutex, noop } from "es-toolkit";

interface UpdaterStore {
    autoUpdate: boolean;
    notify: boolean;

    isCheckingForUpdates: boolean;
    availableUpdate: null | UpdateInfo;

    setAutoUpdate: (value: boolean) => void;
    setNotify: (value: boolean) => void;
    checkForUpdates: () => Promise<UpdateInfo | null>;
}

const _updateMutex = new Mutex();

export const useUpdaterStore = create<UpdaterStore>((set, get) => ({
    autoUpdate: true,
    notify: true,

    isCheckingForUpdates: false,
    availableUpdate: null,

    setAutoUpdate: value => set({ autoUpdate: value, notify: false }),
    setNotify: value => set({ notify: value }),
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
}));

export function showUpdateAvailableAlert(updateInfo: UpdateInfo) {
    showAlert({
        key: "update-available",
        content: {
            title: "Update Available",
            content: "A new version of Wintry is available!",
            extraContent: (
                <Card>
                    <Text variant="text-md/medium">{updateInfo.hash || "Unknown hash"}</Text>
                </Card>
            ),
            actions: [
                {
                    text: "Download",
                    onPress: () => {
                        return UpdaterModule.updateBundle();
                    },
                },
                {
                    text: "Nevermind",
                    variant: "secondary",
                    onPress: () => {},
                },
            ],
        },
    });
}

export function showAlreadyUpdatedToast() {
    showToast({
        content: "You're already on the latest version!",
    });
}

// TODO: Show more proper
export function showUpdateErrorToast(error: unknown) {
    showToast({
        content: "An error occurred while checking for updates.",
        options: {
            onPress: () => {
                showUpdateErrorAlert(error);
            },
        },
    });
}

export function showUpdateErrorAlert(error: unknown) {
    showAlert({
        key: "update-error",
        content: {
            title: "Failed to check for updates",
            content: "An error occurred while checking for updates.",
            extraContent: <ErrorCard header={null} showStackTrace={true} error={error} />,
            actions: [
                {
                    text: "Dismiss",
                    variant: "destructive",
                    onPress: noop,
                },
            ],
        },
    });
}
