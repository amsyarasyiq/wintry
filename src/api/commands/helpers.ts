import { Clyde, MessageActions } from "@metro/common/libraries";
import type { Message } from "discord-types/general";
import { toMerged } from "es-toolkit";
import type { PartialDeep } from "type-fest";
import type { CommandOption, WintryApplicationCommandDefinition } from "./types";

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

/**
 * Only exists for type safety, does not actually do anything. Only returns the command as is.
 * To register a command, use `registerCommand` instead.
 * @param command The command to define.
 */
export function defineCommand<const CO extends readonly CommandOption[]>(
    command: WintryApplicationCommandDefinition<CO>,
): WintryApplicationCommandDefinition<CommandOption[]> {
    return command as unknown as WintryApplicationCommandDefinition<CommandOption[]>;
}
