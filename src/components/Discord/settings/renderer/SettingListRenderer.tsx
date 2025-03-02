import type { SettingSection } from "@api/settings";
import { lookup } from "@metro";
import { byFilePath } from "@metro/common/filters";

interface SettingListProps {
    sections: SettingSection[];
}

interface SettingListRendererModule {
    SettingsList: React.MemoExoticComponent<React.ComponentType<SettingListProps>>;
    SearchableSettingsList: React.MemoExoticComponent<React.ComponentType<SettingListProps>>;
}

export const { SettingsList, SearchableSettingsList } = lookup(
    byFilePath("modules/main_tabs_v2/native/settings/renderer/SettingListRenderer.tsx"),
).asLazy() as SettingListRendererModule;
