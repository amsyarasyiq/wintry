import type { Channel, Guild } from "discord-types/general";

// =============================================================================
// Enums and Constants
// =============================================================================

export const ApplicationCommandType = {
    CHAT: 1,
    USER: 2,
    MESSAGE: 3,
} as const;

export type ApplicationCommandType = (typeof ApplicationCommandType)[keyof typeof ApplicationCommandType];

export const ApplicationCommandInputType = {
    BUILT_IN: 0,
    BUILT_IN_TEXT: 1,
    BUILT_IN_INTEGRATION: 2,
    BOT: 3,
    PLACEHOLDER: 4,
} as const;

export type ApplicationCommandInputType =
    (typeof ApplicationCommandInputType)[keyof typeof ApplicationCommandInputType];

export const ApplicationCommandOptionType = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
    ATTACHMENT: 11,
} as const;

export type ApplicationCommandOptionType =
    (typeof ApplicationCommandOptionType)[keyof typeof ApplicationCommandOptionType];

// =============================================================================
// Base Interfaces
// =============================================================================

export interface BaseCommandOption {
    name: string;
    displayName?: string;
    type: ApplicationCommandOptionType;
    description: string;
    displayDescription?: string;
    required?: boolean;
    options?: readonly CommandOption[];
    choices?: Array<ChoicesOption>;
}

export interface BaseArgument {
    name: string;
    description: string;
    displayName?: string;
    displayDescription?: string;
    focused?: undefined;
    options?: Argument[];
    required?: boolean;
}

export interface ChoicesOption {
    label: string;
    name: string;
    displayName?: string;
}

// =============================================================================
// Command Option Types
// =============================================================================

export interface StringCommandOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.STRING;
    choices?: Array<ChoicesOption & { value: string }>;
}

export interface IntegerCommandOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.INTEGER;
    choices?: Array<ChoicesOption & { value: number }>;
}

export interface NumberCommandOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.NUMBER;
    choices?: Array<ChoicesOption & { value: number }>;
}

export interface BooleanCommandOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.BOOLEAN;
}

export interface UserCommandOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.USER;
}

export interface ChannelCommandOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.CHANNEL;
}

export interface RoleCommandOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.ROLE;
}

export interface MentionableCommandOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.MENTIONABLE;
}

export interface AttachmentCommandOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.ATTACHMENT;
}

export interface SubCommandOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.SUB_COMMAND;
    options?: CommandOption[];
}

export interface SubCommandGroupOption extends BaseCommandOption {
    type: typeof ApplicationCommandOptionType.SUB_COMMAND_GROUP;
    options?: CommandOption[];
}

export type CommandOption =
    | StringCommandOption
    | IntegerCommandOption
    | NumberCommandOption
    | BooleanCommandOption
    | UserCommandOption
    | ChannelCommandOption
    | RoleCommandOption
    | MentionableCommandOption
    | AttachmentCommandOption
    | SubCommandOption
    | SubCommandGroupOption;

// =============================================================================
// Argument Types (Runtime Values)
// =============================================================================

export interface StringArgument extends BaseArgument {
    type: typeof ApplicationCommandOptionType.STRING;
    value: string;
}

export interface IntegerArgument extends BaseArgument {
    type: typeof ApplicationCommandOptionType.INTEGER;
    value: number;
}

export interface NumberArgument extends BaseArgument {
    type: typeof ApplicationCommandOptionType.NUMBER;
    value: number;
}

export interface BooleanArgument extends BaseArgument {
    type: typeof ApplicationCommandOptionType.BOOLEAN;
    value: boolean;
}

export interface UserArgument extends BaseArgument {
    type: typeof ApplicationCommandOptionType.USER;
    value: string; // User ID
}

export interface ChannelArgument extends BaseArgument {
    type: typeof ApplicationCommandOptionType.CHANNEL;
    value: string; // Channel ID
}

export interface RoleArgument extends BaseArgument {
    type: typeof ApplicationCommandOptionType.ROLE;
    value: string; // Role ID
}

export interface MentionableArgument extends BaseArgument {
    type: typeof ApplicationCommandOptionType.MENTIONABLE;
    value: string; // User or Role ID
}

export interface AttachmentArgument extends BaseArgument {
    type: typeof ApplicationCommandOptionType.ATTACHMENT;
    value: string; // Attachment ID
}

export type Argument =
    | StringArgument
    | IntegerArgument
    | NumberArgument
    | BooleanArgument
    | UserArgument
    | ChannelArgument
    | RoleArgument
    | MentionableArgument
    | AttachmentArgument;

// =============================================================================
// Type Mapping and Utilities
// =============================================================================

type MapCommandOptionToArgument<T extends readonly CommandOption[]> = {
    [K in keyof T]: T[K] extends CommandOption
        ? T[K] extends StringCommandOption
            ? StringArgument
            : T[K] extends IntegerCommandOption
              ? IntegerArgument
              : T[K] extends NumberCommandOption
                ? NumberArgument
                : T[K] extends BooleanCommandOption
                  ? BooleanArgument
                  : T[K] extends UserCommandOption
                    ? UserArgument
                    : T[K] extends ChannelCommandOption
                      ? ChannelArgument
                      : T[K] extends RoleCommandOption
                        ? RoleArgument
                        : T[K] extends MentionableCommandOption
                          ? MentionableArgument
                          : T[K] extends AttachmentCommandOption
                            ? AttachmentArgument
                            : never
        : never;
};

// =============================================================================
// Command Context and Execution
// =============================================================================

export interface CommandContext {
    channel: Channel;
    guild?: Guild;
}

export interface ApplicationCommand<CO extends readonly CommandOption[]> {
    readonly name: string;
    readonly description: string;
    readonly execute: (args: MapCommandOptionToArgument<CO>, ctx: CommandContext) => void;
    readonly options: CO;
    readonly id?: string;
    readonly applicationId?: string;
    readonly displayName?: string;
    readonly displayDescription?: string;
    readonly untranslatedDescription?: string;
    readonly untranslatedName?: string;
    readonly inputType?: ApplicationCommandInputType;
    readonly type?: ApplicationCommandType;
    readonly __WINTRY_EXTRA?: WintryExtra;
}

interface WintryExtra {
    shouldHide?: () => boolean;
}

export type WintryApplicationCommand<CO extends readonly CommandOption[]> = ApplicationCommand<CO> & WintryExtra;
