import { definePlugin, logger, patcher } from "#plugin-context";
import { Devs } from "@data/constants";
import { lookup } from "@metro";
import { lookupByName, lookupByProps } from "@metro/common/wrappers";
import { SingleMetroModule } from "@metro/module";
import { inspect } from "node-inspect-extracted";
import { establishWebSocketConnection } from "./repl-client";

export default definePlugin({
    name: "DevToolkit",
    description: "A toolkit for developers to ease the development process.",
    authors: [Devs.Pylix],
    version: "1.0.0",
    start() {
        Object.defineProperty(SingleMetroModule.prototype, "l", {
            enumerable: false,
            get() {
                return this.asLazy();
            },
        });

        Object.assign(window, {
            lookup,
            lookupByProps,
            lookupByName,
            ...require("../../metro/common/filters"),
            dk: {
                patcher,
                snipe(mod: any, prop: string) {
                    patcher.after(mod, prop, (args, ret) => {
                        logger.info(`Sniped ${prop}\n${inspect({ args, ret })}`);
                        window._r = { args, ret };
                    });
                },
                shotgun(mod: any) {
                    for (const key in mod) {
                        if (typeof mod[key] === "function") {
                            this.snipe(mod, key);
                        }
                    }
                },
                wipe() {
                    patcher.reuse();
                },
            },
        });

        establishWebSocketConnection();
    },
    stop() {},
});
