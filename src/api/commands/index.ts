import { after } from "@patcher";
import { ApplicationCommandInputType, ApplicationCommandType } from "./types";
import type { ApplicationCommand, WintryApplicationCommand } from "./types";

let registeredCommands: ApplicationCommand[] = [];
const commandIdSet = new Set<string>();

/**
 * Patches the commands module to include Wintry's custom commands.
 * @internal
 */
export function patchCommands(commandsModule: any) {
    const unpatch = after(commandsModule, "getBuiltInCommands", ([type]: any[], res: ApplicationCommand[]) => {
        const commandsToInclude = registeredCommands.filter(
            c => type.includes(c.type) && c.__WINTRY_INTERNALS?.shouldHide?.() !== true,
        );

        // Assign IDs to commands that need them
        for (const command of commandsToInclude) {
            if (!command.id) {
                command.id = generateCommandId([...res, ...commandsToInclude.filter(c => c.id)]);
                commandIdSet.add(command.id);
            }
        }

        return [...res, ...commandsToInclude];
    });

    return () => {
        registeredCommands = [];
        commandIdSet.clear();
        unpatch();
    };
}

export function registerCommand(command: Omit<WintryApplicationCommand, "id">): () => void {
    command.applicationId ??= "-1";
    command.type ??= ApplicationCommandType.CHAT;
    command.inputType = ApplicationCommandInputType.BUILT_IN;
    command.displayName ??= command.name;
    command.untranslatedName ??= command.name;
    command.displayDescription ??= command.description;
    command.untranslatedDescription ??= command.description;

    command.__WINTRY_INTERNALS = {
        shouldHide: command.shouldHide,
    };

    if (command.options) {
        for (const opt of command.options) {
            opt.displayName ??= opt.name;
            opt.displayDescription ??= opt.description;
        }
    }

    // Add it to the commands array (ID will be assigned when getBuiltInCommands is called)
    registeredCommands.push(command);

    return () => {
        registeredCommands = registeredCommands.filter(c => c !== command);

        // @ts-expect-error - command.id can exist in here
        if (command.id) commandIdSet.delete(command.id);
    };
}

/**
 * Generate a unique command ID that doesn't conflict with existing commands
 */
function generateCommandId(currCommands: ApplicationCommand[]): string {
    let baseId = -100;

    if (currCommands.length > 0) {
        const sortedCommands = currCommands.sort((a, b) => Number.parseInt(b.id!) - Number.parseInt(a.id!));
        const lastCommand = sortedCommands[sortedCommands.length - 1];
        if (lastCommand?.id) {
            const lastId = Number.parseInt(lastCommand.id, 10);
            if (!Number.isNaN(lastId)) {
                baseId = Math.min(baseId, lastId - 1);
            }
        }
    }

    // Ensure uniqueness among registered commands
    while (commandIdSet.has(baseId.toString())) {
        baseId--;
    }

    return baseId.toString();
}
