import { lazyValue } from "@utils/lazy";
import { i18nObject } from "./i18n-util" with { lazy: "on" };
import { loadLocale } from "./i18n-util.sync" with { lazy: "on" };

export const t = lazyValue(() => {
    loadLocale("en");
    return i18nObject("en");
}, { hint: "object" });
