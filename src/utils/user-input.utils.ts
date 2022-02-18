import arg from 'arg';
import { IArgs } from '../models/arguments.model';
import { prompt } from 'inquirer';
import { Questions } from '../enums/questions.enum';
import { ICommand } from '../models/script.model';

export function parseArguments(rawArgs: any[]): IArgs {
    const args = arg({
        '--run': Boolean,
        '--delete': Boolean,
        '--list': Boolean,
        '--clear': Boolean,
        '--help': Boolean,
        '-r': '--run',
        '-d': '--delete',
        '-l': '--list',
        '-c': '--clear',
        '-h': '--help'
    }, {
        argv: rawArgs.slice(1)
    });

    return {
        run: args['--run'] || false,
        delete: args['--delete'] || false,
        list: args['--list'] || false,
        clearAll: args['--clear'] || false,
        help: args['--help'] || false,
        command: args._[1]
    };
}

export function getUserInput(): Promise<{ error: string, action: Questions }> {
    return new Promise<{ error: string, action: Questions }>(async (resolve, reject) => {
        try {
            const answer = await prompt({
                name: 'action',
                type: 'list',
                message: 'What to you need?',
                choices: [
                    Questions.NEW_TASK,
                    Questions.EXISTING_TASK,
                    Questions.LIST,
                    Questions.DELETE,
                    Questions.CLEAR,
                    Questions.HELP
                ],
                default() {
                    return Questions.EXISTING_TASK;
                }
            });
            resolve({ error: null, action: answer.action as Questions });
        } catch (error) {
            reject({ error: error?.message || 'getUserInput faild for some reason', action: null });
        }
    });
}

export async function getNewCommandDetails(): Promise<{ error: any, command: ICommand }> {
    return new Promise<{ error: any, command: ICommand }>(async (resolve, reject) => {
        const kebabCaseRegexPattern = new RegExp('[a-z]([A-Z0-9]*[a-z][a-z0-9]*[A-Z]|[a-z0-9]*[A-Z][A-Z0-9]*[a-z])[A-Za-z0-9]*');
        try {
            const answer = await prompt([
                {
                    message: 'Task name:',
                    name: 'name',
                    type: 'input',
                    validate: (input,) => {
                        if (!kebabCaseRegexPattern.test(input)) {
                            return 'CamelCase only';
                        }
                        return true;
                    }
                },
                {
                    message: 'Alias:',
                    name: 'alias',
                    type: 'input'
                },
                {
                    message: 'Command:',
                    name: 'command',
                    type: 'input'
                }
            ]);
            const command: ICommand = {
                name: answer.name,
                alias: answer?.alias,
                command: answer.command
            };
            resolve({ error: null, command: command });
        } catch (error) {
            reject({ error: error, command: null });
        }
    });
};

export const confirm = (message: string): Promise<any> => {
    return prompt({
        message: message,
        name: 'accept',
        type: 'confirm',
    });
};

export const getTaskName = async (): Promise<any> => {
    return prompt({
        message: 'Type task name:',
        name: 'taskName',
        type: 'input'
    });
};