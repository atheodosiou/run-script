import { getUserInput, parseArguments } from './utils/user-input.utils';
import { createSpinner } from 'nanospinner';
import { showWelcomeMessage } from './utils/welcome.utils';

import chalk from 'chalk';
import { Questions } from './enums/questions.enum';
import { clearTasks, addTask, deleteTaskByName, listAvailableTasks, runTask } from './utils/command.utils';
import { createDb } from './utils/db.utils';
import { getHelp } from './utils/help.utils';

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

const cli = async (args: any[]): Promise<void> => {
    try {
        const options = parseArguments(args);
        const { error, db } = await createDb();
        if (error) {
            console.log(chalk.redBright('Database error:\n' + error.message));
            return;
        }

        if (options && (options?.run || options?.list || options?.delete || options?.clearAll || options?.help)) {
            //Run with options
            if (!options.command) {
                if (options.help) {
                    getHelp();
                } else if (options.list) {
                    await listAvailableTasks(db);
                    return;
                } else if (options.clearAll) {
                    await clearTasks(db);
                } else {
                    console.log(chalk.red('Task name is missing.\n\'run-script\' or \'rs\' <command> <task-name>'));
                    return;
                }
            } else {
                if (options.run && options.command) {
                    await runTask(db, options.command);
                } else if (options.delete && options.command) {
                    await deleteTaskByName(db, options.command);
                } else {
                    console.log(chalk.red('Unkown command'));
                }
            }
        } else {
            try {
                //Start cli
                await showWelcomeMessage('Script Runner CLI');
                const { error, action } = await getUserInput();
                if (error) {
                    console.log(chalk.redBright(error));
                    return;
                }

                if (action === Questions.NEW_TASK) {
                    await addTask(db);
                    return;
                } else if (action === Questions.EXISTING_TASK) {
                    await runTask(db);
                    return;
                } else if (action === Questions.LIST) {
                    await listAvailableTasks(db);
                    return;
                } else if (action === Questions.DELETE) {
                    await deleteTaskByName(db);
                    return;
                } else if (action === Questions.CLEAR) {
                    await clearTasks(db);
                    return;
                } else if (action === Questions.HELP) {
                    getHelp();
                    return;
                } else {
                    console.log(chalk.redBright('Unknown option! Run ts -h for help.'));
                }
            } catch (error) {
                console.log(chalk.redBright(JSON.stringify(error)));
            }
        }

    } catch (e) {
        if (e.code === 'ARG_UNKNOWN_OPTION') {
            console.log(chalk.red('Unknown argument! Run ts -h for help. '));
        }
    }
};

export {
    cli
};