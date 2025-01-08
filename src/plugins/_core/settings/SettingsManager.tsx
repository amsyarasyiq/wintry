import { uniqueId } from "es-toolkit/compat";
import React from "react";
import type { Text } from "react-native";
import { findByProps } from "../../../metro/api";

interface SectionConfig {
    name: string;
    items: SettingRowConfig[];
}

interface SettingRowConfig {
    key: string;
    title: () => string;
    onPress?: () => any;
    render?: Parameters<typeof React.lazy>[0];
    IconComponent?: React.ComponentType;
    usePredicate?: () => boolean;
    useTrailing?: () => React.ComponentProps<typeof Text>["children"];
    rawTabsConfig?: Record<string, any>;
}

const tabsNavigationRef = findByProps("getRootNavigationRef");

export default class SettingsManager {
    registeredSections = new Map<string, SectionConfig>();

    registerSection(section: SectionConfig) {
        const id = uniqueId("section_");
        this.registeredSections.set(id, section);
        return Object.assign(() => this.registeredSections.delete(id), { id });
    }

    getRowConfigs() {
        const rows: Record<string, any> = {};

        for (const section of this.registeredSections.values()) {
            for (const row of section.items) {
                rows[row.key] = {
                    type: "pressable",
                    title: row.title,
                    IconComponent: row.IconComponent,
                    usePredicate: row.usePredicate,
                    useTrailing: row.useTrailing,
                    onPress: () => {
                        if (row.onPress) return row.onPress();

                        const Component = React.lazy(row.render!);
                        tabsNavigationRef.getRootNavigationRef().navigate("BUNNY_CUSTOM_PAGE", {
                            title: row.title(),
                            render: () => <Component />,
                        });
                    },
                    withArrow: true,
                    ...row.rawTabsConfig,
                };
            }
        }

        return rows;
    }
}
