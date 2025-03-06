import { Card, Text } from "@components/Discord";
import UpdaterModule, { type UpdateInfo } from "@native/modules/UpdaterModule";
import { create } from "zustand";
import { showAlert } from "@api/alerts";
import ErrorCard from "@components/ErrorCard";
import { showToast } from "@api/toasts";
import { Mutex, noop } from "es-toolkit";
import { t } from "@i18n";

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
            title: t.updater.update_available(),
            content: t.updater.new_version(),
            extraContent: (
                <Card>
                    <Text variant="text-md/medium">{updateInfo.hash || "Unknown hash"}</Text>
                </Card>
            ),
            actions: [
                {
                    text: t.updater.update_now(),
                    onPress: () => {
                        return UpdaterModule.updateBundle();
                    },
                },
                {
                    text: t.actions.nevermind(),
                    variant: "secondary",
                    onPress: () => {},
                },
            ],
        },
    });
}

export function showAlreadyUpdatedToast() {
    showToast({
        content: t.updater.already_latest(),
    });
}

// TODO: Show more proper
export function showUpdateErrorToast(error: unknown) {
    showToast({
        content: t.updater.failed_to_check(),
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
        },
    });
}
