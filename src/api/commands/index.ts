import { after } from "@patcher";
import { ApplicationCommandInputType, ApplicationCommandType } from "./types";
import type { ApplicationCommand, CommandOption, WintryApplicationCommand } from "./types";
import type { Mutable } from "@utils/types";

let registeredCommands: WintryApplicationCommand<readonly CommandOption[]>[] = [];
const commandIdSet = new Set<string>();

/**
 * Patches the commands module to include Wintry's custom commands.
 * @internal
 */
export function patchCommands(commandsModule: any) {
    const unpatch = after(commandsModule, "getBuiltInCommands", ([type]: any[], res: ApplicationCommand<any>[]) => {
        const commandsToInclude = registeredCommands.filter(
            c => type.includes(c.type) && c.__WINTRY_EXTRA?.shouldHide?.() !== true,
        );

        // Assign IDs to commands that need them
        for (const command of commandsToInclude) {
            if (!command.id) {
                // @ts-ignore: It's okay to mutate the command here
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

export function registerCommand<const CO extends readonly CommandOption[]>(
    command: Mutable<WintryApplicationCommand<CO> & { id?: never }>,
): () => void {
    command.applicationId ??= "-1";
    command.type ??= ApplicationCommandType.CHAT;
    command.inputType = ApplicationCommandInputType.BUILT_IN;
    command.displayName ??= command.name;
    command.untranslatedName ??= command.name;
    command.displayDescription ??= command.description;
    command.untranslatedDescription ??= command.description;

    command.__WINTRY_EXTRA = {
        shouldHide: command.shouldHide,
    };

    if (command.options) {
        for (const opt of command.options) {
            opt.displayName ??= opt.name;
            opt.displayDescription ??= opt.description;
        }
    }

    // Add it to the commands array (ID will be assigned when getBuiltInCommands is called)
    registeredCommands.push(command as unknown as WintryApplicationCommand<readonly CommandOption[]>);

    return () => {
        registeredCommands = registeredCommands.filter(c => c !== command);
        if (command.id) commandIdSet.delete(command.id);
    };
}

/**
 * Generate a unique command ID that doesn't conflict with existing commands
 */
function generateCommandId(currCommands: ApplicationCommand<CommandOption[]>[]): string {
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
