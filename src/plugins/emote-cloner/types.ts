export interface EmojiNode {
    src: string;
    alt: string;
    id: string;
}

export interface PartialGuild {
    id: string;
    name: string;
    getMaxEmojiSlots: () => number;
}
