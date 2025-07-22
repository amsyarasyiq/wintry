import { wtlogger } from "@api/logger";
import { initCheckForUpdates } from "@stores/useUpdaterStore";
import reportErrorOnInitialization from "./error-reporter";
import { wintryGlobalObject } from "./globals";
import { initializeMetro } from "./metro/internal";
import { initializePlugins } from "./stores/usePluginStore";

export function initializeWintry() {
    try {
        wtlogger.info("Initializing Wintry...");

        initializeMetro();
        initializePlugins();

        initCheckForUpdates();

        window.wintry = wintryGlobalObject();

        wtlogger.info(`Fully initialized Wintry in ${(nativePerformanceNow() - WINTRY_START_TIME).toFixed(2)}ms!`);
    } catch (e) {
        reportErrorOnInitialization(e);
    }
}
