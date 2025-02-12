import { processColor } from "react-native";
import LoaderModule from "./LoaderModule";

export default new (class BubbleModule extends LoaderModule {
    constructor() {
        super("BubbleModule");
    }

    public hookBubbles() {
        return this.callFunction("hookBubbles", []);
    }

    public unhookBubbles() {
        return this.callFunction("unhookBubbles", []);
    }

    public setRadius(avatarRadius: number, bubbleRadius: number) {
        return this.callFunction("setRadius", [avatarRadius, bubbleRadius]);
    }

    public setBubbleColor(color: string) {
        const parsed = Number(processColor(color));
        return this.callFunction("setBubbleColor", [parsed]);
    }
})();
