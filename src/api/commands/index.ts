import { after } from "@patcher";
import { ApplicationCommandInputType, ApplicationCommandType } from "./types";
import type {
    ApplicationCommand,
    CommandOption,
    WintryApplicationCommand,
    WintryApplicationCommandDefinition,
} from "./types";

let registeredCommands: WintryApplicationCommand<readonly CommandOption[]>[] = [];

/**
 * Patches the commands module to include Wintry's custom commands.
 * @internal
 */
export function patchCommands(commandsModule: any) {
    const unpatch = after(commandsModule, "getBuiltInCommands", ([type]: any[], res: ApplicationCommand<any>[]) => {
        const commandsToInclude = registeredCommands.filter(c => type.includes(c.type) && c.wtPredicate?.() !== false);

        // Assign IDs to commands that need them
        for (const command of commandsToInclude) {
            if (!command.id) {
                // @ts-ignore: It's okay to mutate the command here
                command.id = generateCommandId([...res, ...commandsToInclude.filter(c => c.id)]);
            }
        }

        return [...res, ...commandsToInclude];
    });

    return () => {
        registeredCommands = [];
        unpatch();
    };
}

export function registerCommand<const CO extends readonly CommandOption[]>(
    command: WintryApplicationCommandDefinition<CO>,
): () => void {
    command.applicationId ??= "-1";
    command.type ??= ApplicationCommandType.CHAT;
    command.inputType = ApplicationCommandInputType.BUILT_IN;
    command.displayName ??= command.name;
    command.untranslatedName ??= command.name;
    command.displayDescription ??= command.description;
    command.untranslatedDescription ??= command.description;

    if (command.options) {
        for (const opt of command.options) {
            opt.displayName ??= opt.name;
            opt.displayDescription ??= opt.description;
        }
    }

    const registeredCommand = command as unknown as WintryApplicationCommand<readonly CommandOption[]>;
    // Add it to the commands array (ID will be assigned when getBuiltInCommands is called)
    registeredCommands.push(registeredCommand);

    return () => {
        registeredCommands = registeredCommands.filter(c => c !== registeredCommand);
    };
}

/**
 * Generate a unique command ID that doesn't conflict with existing commands
 */
function generateCommandId(currCommands: ApplicationCommand<CommandOption[]>[]): string {
    let baseId = -100;

    if (currCommands.length > 0) {
        for (const cmd of currCommands) {
            const id = Number.parseInt(cmd.id, 10);
            if (id <= baseId) {
                baseId = id - 1;
            }
        }
    }

    return baseId.toString();
}
