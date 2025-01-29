import LoaderModule from "./LoaderModule";

export default new class BubbleModule extends LoaderModule {
    constructor() {
        super("BubbleModule");
    }

    public setRadius(avatarRadius: number, bubbleRadius: number) {
        return this.callFunction("setRadius", [avatarRadius, bubbleRadius]);
    }
}