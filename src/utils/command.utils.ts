import { readFile, writeFile, existsSync, unlink } from 'fs';
import { join } from 'path';
import { ICommand } from '../models/script.model';
import { clearAll } from './db.utils';
import Datastore from 'nedb';
import { createSpinner } from 'nanospinner';
import { confirm, getNewCommandDetails, getTaskName } from './user-input.utils';
import chalk from 'chalk';
import { prompt } from 'inquirer';
import { exec } from 'shelljs';

const getCommands = async (fileName: string): Promise<{ error: string, data: ICommand[] }> => {
    return new Promise<{ error: string, data: ICommand[] }>((resolve, reject) => {
        try {
            readFile(fileName, 'utf-8', async (error, data) => {
                if (error) {
                    resolve({ error: error.message, data: null });
                }
                if (!data || data === '') {
                    resolve({ error: 'No data found in the file', data: [] });
                } else {
                    resolve({ error: null, data: JSON.parse(data) });
                }
            });
        } catch (error) {
            resolve({ error: error?.message || 'getCommands faild for some reason', data: [] });
        }
    });
};

const addCommand = async (fileName: string, newCommand: ICommand): Promise<{ error: string, isOk: boolean }> => {
    return new Promise<{ error: string, isOk: boolean }>(async (resolve, reject) => {
        try {
            const commands: ICommand[] = [];
            if (existsSync(fileName)) {
                try {
                    const result = await getCommands(fileName);
                    if (result.error) {
                        commands.push(newCommand);
                    } else {
                        commands.push(...result.data);
                        commands.push(newCommand);
                    }
                } catch (error) {
                    resolve({ error: error, isOk: false });
                }
            } else {
                commands.push(newCommand);
            }

            writeFile(fileName, JSON.stringify(commands), (error) => {
                if (error) {
                    resolve({ error: error.message, isOk: false });
                    return;
                }
                resolve({ error: null, isOk: true });
                return;
            });
        } catch (error) {
            resolve({ error: error?.message || 'addCommand faild for some reason', isOk: false });
        }
    });
};

const addTask = async (db: Datastore): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
        const spinner = createSpinner('Adding new task...');
        try {
            const result = await getNewCommandDetails();
            spinner.start();
            if (result.error) {
                spinner.error({ text: result.error });
                resolve();
            }

            const commandToAdd = result.command;

            //check if there is a task with the same name
            db.find({ name: commandToAdd.name }, (err, docs) => {
                if (err) {
                    spinner.error({ text: err.message });
                    return resolve();
                }
                if (docs?.length > 0) {
                    spinner.error({ text: 'Name already in use' });
                    return resolve();
                }

                db.insert(commandToAdd, (error, doc) => {
                    if (error) {
                        spinner.error({ text: error.message });
                        return resolve();
                    }
                    spinner.success({ text: 'Success' });
                    return resolve();
                });
            });

        } catch (error) {
            spinner.error({ text: error });
            return resolve();
        }
    });
};

const clearTasks = async (db: Datastore): Promise<void> => {
    const answer = await confirm('Are you sure?');
    if (answer?.accept) {
        const spinner = createSpinner('Deleting all tasks...').start();
        const result = await clearAll(db);
        if (result.error) {
            spinner.error({ text: result.error });
        } else {
            spinner.success({ text: 'Success' });
        }
    }
};

const deleteTaskByName = async (db: Datastore, task?: string): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
        let taskNameToDelete;
        if (!task) {
            const { taskName } = await getTaskName();
            taskNameToDelete = taskName;
        } else {
            taskNameToDelete = task;
        }

        const answer = await confirm('Are you sure?');

        if (answer?.accept) {
            const spinner = createSpinner('Deleting task ' + taskNameToDelete + '...').start();
            db.remove({ name: taskNameToDelete }, { multi: false }, (err, n) => {
                if (err) {
                    spinner.error({ text: err.message });
                    reject();
                }
                if (n > 0) {
                    spinner.success({ text: 'Success' });
                    resolve();
                } else {
                    spinner.error({ text: 'Unable to delete task ' + taskNameToDelete });
                    resolve();
                }
            });
        }
    });
};

const listAvailableTasks = (db: Datastore): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
        const spinner = createSpinner('Listing tasks...\n').start();
        const tasks = db.getAllData().map(x => x.name);
        if (tasks.length === 0) {
            spinner.error({ text: 'There are not available tasks yet' });
            resolve();
        } else {
            spinner.success({ text: 'Found ' + tasks.length + ' tasks' });
            tasks.forEach(t => console.log(t));
        }
    });
};

const runTask = (db: Datastore, task?: string): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
        const tasks = db.getAllData();
        let taskName: string;
        if (!task) {
            if (tasks.length === 0) {
                console.log(chalk.redBright('There are no available tasks yet'));
                resolve();
                return;
            }

            const answer = await prompt({
                message: 'Select task to run',
                name: 'taskName',
                type: 'list',
                choices: tasks.map(x => x.name)
            });

            taskName = answer.taskName;
        } else {
            taskName = task;
        }
        const commandToRun = tasks.find(x => x.name === taskName);
        const spinner = createSpinner('Running task ' + taskName + '\n').start();

        if (!commandToRun) {
            spinner.error({ text: 'Task not found' });
            return;
        }
        exec(commandToRun.command, (code, stdout, stderr) => {
            if (stderr) {
                spinner.error({ text: stderr + '\nExit code: ' + code });
                return resolve();
            }
            console.log(chalk.blueBright(stdout));
            spinner.success({ text: 'Success!\nExit code: ' + code });
            return resolve();
        });
    });
};

export {
    getCommands,
    addCommand,
    clearTasks,
    addTask,
    deleteTaskByName,
    listAvailableTasks,
    runTask
};