import { getCurrentRef } from "../useThemeStore";
import { getNativeModule } from "@native";
import { patcher } from "#plugin-context";
import { chroma } from "@metro/common/libraries";
import { byWriteableProp } from "@metro/common/filters";
import { lookup } from "@metro";
import { hasInitialThemeStateBeenRestored } from "./stores";

const isThemeModule = lookup(byWriteableProp("isThemeDark")).asLazy();

export default function patchDefinitionAndResolver(tokensModule: any) {
    const origRaw = { ...tokensModule.RawColor };
    const callback = ([theme]: any[]) => (theme === getCurrentRef()?.key ? [getCurrentRef()!.color.reference] : void 0);

    for (const key of Object.keys(tokensModule.RawColor)) {
        Object.defineProperty(tokensModule.RawColor, key, {
            configurable: true,
            enumerable: true,
            get: () => {
                if (!hasInitialThemeStateBeenRestored) return origRaw[key];
                const ret = getCurrentRef()?.color.raw[key];
                return ret || origRaw[key];
            },
        });
    }

    patcher.before(isThemeModule, "isThemeDark", callback);
    patcher.before(isThemeModule, "isThemeLight", callback);

    patcher.before(getNativeModule("NativeThemeModule"), "updateTheme", callback);

    patcher.instead(tokensModule.default.internal, "resolveSemanticColor", (args: any[], orig: any) => {
        const _colorRef = getCurrentRef();
        if (!_colorRef) return orig(...args);
        if (args[0] !== getCurrentRef()!.key) return orig(...args);

        args[0] = _colorRef.color.reference;

        const [name, colorDef] = extractInfo(tokensModule, _colorRef.color!.reference, args[1]);

        const semanticDef = _colorRef.color.semantic[name];

        if (semanticDef?.value) {
            if (semanticDef.opacity === 1) return semanticDef.value;
            return chroma(semanticDef.value).alpha(semanticDef.opacity).hex();
        }

        const rawValue = _colorRef.color.raw[colorDef.raw];
        if (rawValue) {
            // Set opacity if needed
            return colorDef.opacity === 1 ? rawValue : chroma(rawValue).alpha(colorDef.opacity).hex();
        }

        // Fallback to default
        return orig(...args);
    });

    patcher.attachDisposer(() => {
        // Not the actual module but almost the same thing
        Object.defineProperty(tokensModule, "RawColor", {
            configurable: true,
            writable: true,
            value: origRaw,
        });
    });
}

function extractInfo(tokensModule: any, themeName: string, colorObj: any): [name: string, colorDef: any] {
    // @ts-ignore - assigning to extractInfo._sym
    const propName = colorObj[(extractInfo._sym ??= Object.getOwnPropertySymbols(colorObj)[0])];
    const colorDef = tokensModule.SemanticColor[propName];

    return [propName, colorDef[themeName]];
}
