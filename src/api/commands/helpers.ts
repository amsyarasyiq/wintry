import { Clyde, MessageActions } from "@metro/common/libraries";
import type { Message } from "discord-types/general";
import { toMerged } from "es-toolkit";
import type { PartialDeep } from "type-fest";

export function replyCommand(channelId: string, message: PartialDeep<Message>, ephemeral = true): Message {
    if (ephemeral) {
        return sendBotMessage(channelId, message);
    }

    return MessageActions.sendMessage(channelId, message);
}

/**
 * Send a message as Clyde
 * @param {string} channelId ID of channel to send message to
 * @param {Message} message Message to send
 * @returns {Message}
 */
export function sendBotMessage(channelId: string, message: PartialDeep<Message>): Message {
    const botMessage = Clyde.createBotMessage({ channelId, content: "", embeds: [] });

    MessageActions.receiveMessage(channelId, toMerged(botMessage, message));

    return message as Message;
}
