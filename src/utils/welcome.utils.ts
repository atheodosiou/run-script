import { text } from 'figlet';
import chalk from 'chalk';
import shell from 'shelljs';

export function showWelcomeMessage(message = 'Run Script') {
    return new Promise<void>((resolve, reject) => {
        text(message, (error: Error, result: string) => {
            if (error) {
                console.log(chalk.blueBright(message));
                reject();
            }
            console.log(chalk.blueBright(result) + '\n\n');
            console.log(chalk.yellowBright('Run Script CLI:')+' 1.0.0');
            console.log(chalk.yellowBright('Author:')+' Anastasios Theodosiou');
            const version = shell.exec('node --version', { silent: true }).stdout;
            console.log(chalk.yellowBright('Node: ') + version);
            resolve();
        });
    });
}