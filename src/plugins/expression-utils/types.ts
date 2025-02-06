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

export interface EmojiUploadFailure {
    ok: false;
    headers: Record<string, string>;
    body: { name: [string] };
    text: string;
    status: number;
}
