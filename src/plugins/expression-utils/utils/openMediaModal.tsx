import { hideSheet } from "@components/utils/sheets";
import { Dimensions, Image } from "react-native";
import { MediaViewer } from "../common";

function getSizeAsync(src: string): Promise<[width: number, height: number]> {
    return new Promise((resolve, reject) => {
        Image.getSize(
            src,
            (width, height) => {
                resolve([width, height]);
            },
            reject,
        );
    });
}
export async function openMediaModal(src: string) {
    const [width, height] = await getSizeAsync(src);
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

    hideSheet("MessageEmojiActionSheet");
    MediaViewer.openMediaModal({
        initialSources: [
            {
                uri: src,
                sourceURI: src,
                width,
                height,
            },
        ],
        initialIndex: 0,
        originLayout: {
            width: 128,
            height: 128,
            x: screenWidth / 2 - 64,
            y: screenHeight - 64,
            resizeMode: "fill",
        },
    });
}
