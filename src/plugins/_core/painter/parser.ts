import { Platform } from "react-native";
import type { WintryTheme } from "./types";
import { chroma } from "@metro/common/libraries";
import { lookupByProps } from "@metro/common/wrappers";
import { logger } from "#plugin-context";

const tokensModule = lookupByProps("SemanticColor").asLazy();

const determineColorReference = (type: string) => (type === "dark" ? "darker" : "light");

interface ProcessedTheme {
    reference: "darker" | "light";
    semantic: Record<
        string,
        {
            value: string;
            opacity: number;
        }
    >;
    raw: Record<string, string>;
    background?: WintryTheme["main"]["background"];
}

export function parseColorManifest(manifest: WintryTheme): ProcessedTheme {
    const semanticColorDefinitions: ProcessedTheme["semantic"] = {};

    for (const [semanticColorKey, semanticColorValue] of Object.entries(manifest.main.colors.semantic ?? {})) {
        const { value, opacity: semanticColorOpacity } = semanticColorValue;

        if (value[0] === "#") {
            semanticColorDefinitions[semanticColorKey] = {
                value,
                opacity: semanticColorOpacity ?? 1,
            };
        } else if (value[0] === "$") {
            const rawColorValue = tokensModule.RawColor[value.slice(1)];
            if (!rawColorValue) {
                logger.warn(`Unknown raw color reference: ${value}`);
                continue;
            }

            semanticColorDefinitions[semanticColorKey] = {
                value: rawColorValue,
                opacity: semanticColorOpacity ?? 1,
            };
        }
    }

    return {
        reference: determineColorReference(manifest.main.base),
        semantic: semanticColorDefinitions,
        raw: maybeApplyAndroidExtraKeys(manifest.main.colors.raw),
        background: manifest.main.background,
    };
}

export function maybeApplyAndroidExtraKeys(rawColors: Record<string, string>) {
    if (Platform.OS !== "android") return rawColors;
    if (!rawColors) return {};

    const copy = { ...rawColors };

    // these are native Discord Android keys
    const alphaMap: Record<string, [string, number]> = {
        BLACK_ALPHA_60: ["BLACK", 0.6],
        BRAND_NEW_360_ALPHA_20: ["BRAND_360", 0.2],
        BRAND_NEW_360_ALPHA_25: ["BRAND_360", 0.25],
        BRAND_NEW_500_ALPHA_20: ["BRAND_500", 0.2],
        PRIMARY_DARK_500_ALPHA_20: ["PRIMARY_500", 0.2],
        PRIMARY_DARK_700_ALPHA_60: ["PRIMARY_700", 0.6],
        STATUS_GREEN_500_ALPHA_20: ["GREEN_500", 0.2],
        STATUS_RED_500_ALPHA_20: ["RED_500", 0.2],
    };

    for (const key in alphaMap) {
        const [colorKey, alpha] = alphaMap[key];
        if (!rawColors[colorKey]) continue;
        copy[key] ??= chroma(rawColors[colorKey]).alpha(alpha).hex();
    }

    return copy;
}
