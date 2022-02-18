import chalk from 'chalk';
import { showWelcomeMessage } from './welcome.utils';

export const getHelp = async () => {
    await showWelcomeMessage('Run Script');
    console.log(chalk.yellowBright('[HELP]') + ' ' + chalk.blueBright('\'run-script\' is a cli for helping you to manage all your scripts\n\n'));
    console.log(chalk.white('Type \'run-script\' or \'rs\' <option> <script_name>\n\n'));
    console.log(chalk.yellowBright('[OPTIONS]\n'));
    console.log(chalk.blueBright('--run, -r      ')+chalk.white('Runs a script by name. E.g. rs -r script'));
    console.log(chalk.blueBright('--delete, -d   ')+chalk.white('Deletes a script by name. E.g. rs -d script'));
    console.log(chalk.blueBright('--list, -l     ')+chalk.white('Listing available scrips. E.g. rs -l'));
    console.log(chalk.blueBright('--clear, -c    ')+chalk.white('Clears all scripts. E.g. rs -c'));
    console.log(chalk.blueBright('--help, -h     ')+chalk.white('Help E.g. rs -h\n'));
};