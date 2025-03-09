import { wtlogger } from "@api/logger";
import reportErrorOnInitialization from "./error-reporter";
import { wintryGlobalObject } from "./globals";
import { initializeMetro } from "./metro/internal";
import { initializePlugins } from "./stores/usePluginStore";
import { isSafeModeEnabled } from "./stores/usePrefsStore";

Object.freeze = Object.seal = Object;

export function initializeWintry() {
    try {
        wtlogger.info("Initializing Wintry...");

        initializeMetro();

        // TODO: Required plugins should run anyways, so move this safe mode check to a better place
        if (!isSafeModeEnabled()) {
            initializePlugins();
        }

        window.wintry = wintryGlobalObject();

        wtlogger.info(`Fully initialized Wintry in ${nativePerformanceNow() - WINTRY_START_TIME}ms!`);
    } catch (e) {
        reportErrorOnInitialization(e);
    }
}
