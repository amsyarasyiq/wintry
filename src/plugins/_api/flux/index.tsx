import { definePlugin } from "#plugin-context";
import { injectFluxInterceptor } from "@api/flux";
import { Devs } from "@data/constants";
import { byProps } from "@metro/common/filters";

export default definePlugin({
    name: "FluxAPI",
    description: "Provides an API for intercepting Flux dispatches.",
    authors: [Devs.Pylix],

    required: true,

    patches: [
        {
            id: "intercept-flux-dispatcher",
            target: byProps(["_interceptors"]),
            patch(module, patcher) {
                const uninject = injectFluxInterceptor(module);
                patcher.attachDisposer(() => void uninject());
            },
        },
    ],
});
