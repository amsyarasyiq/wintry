import { Dev } from "@data/constants";
import { definePlugin } from "#plugin-context";
import { byStoreName } from "@metro/common/stores";

export default definePlugin({
    name: "Always Trust",
    description: "Prevents Discord's trust website confirmations",
    authors: [Dev.cocobo1],

    patches: [
        {
            id: "MaskedLinkStore",
            target: byStoreName("MaskedLinkStore"),
            patch(module, patcher) {
                patcher.instead(module, "isTrustedDomain", () => true);
            },
        },
    ],
});
