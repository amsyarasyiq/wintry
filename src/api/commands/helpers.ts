import { Clyde, MessageActions } from "@metro/common/libraries";
import type { Message } from "discord-types/general";
import { toMerged } from "es-toolkit";
import type { PartialDeep } from "type-fest";
import type { CommandOption, WintryApplicationCommandDefinition } from "./types";

/**
 * Sends a reply message to a specified channel, with optional ephemeral behavior.
 *
 * @param channelId - The ID of the channel to send the message to.
 * @param message - The message content to send, as a partial deep structure of the Message type.
 * @param ephemeral - If true, sends the message as an ephemeral (temporary) bot message. Defaults to true.
 */
export function replyCommand(channelId: string, message: PartialDeep<Message>, ephemeral = true) {
    if (ephemeral) {
        sendBotMessage(channelId, message);
        return;
    }

    MessageActions.sendMessage(channelId, message);
}

/**
 * Send a message as Clyde
 * @param channelId - ID of channel to send message to
 * @param message - Message to send
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
