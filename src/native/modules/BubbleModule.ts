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

    public configure(avatarRadius: number, bubbleRadius: number, bubbleColor: string) {
        return this.callFunction("configure", [avatarRadius, bubbleRadius, Number(processColor(bubbleColor))]);
    }
})();
