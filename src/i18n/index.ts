import "intl-pluralrules";
import { i18nObject } from "./i18n-util";
import { loadLocale } from "./i18n-util.sync";

loadLocale("en");

export const t = i18nObject("en");
