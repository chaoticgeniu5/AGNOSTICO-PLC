import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { api } from '../lib/api';

export const authCommands = {
  async login() {
    console.log(chalk.cyan('\n🔐 Login to Industrial Gateway Platform\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Username:',
        validate: (input) => input.length > 0 || 'Username is required',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*',
        validate: (input) => input.length > 0 || 'Password is required',
      },
    ]);

    const spinner = ora('Authenticating...').start();

    try {
      const result = await api.login(answers.username, answers.password);
      spinner.succeed(chalk.green('Login successful'));

      console.log(chalk.gray('\nUser:'), chalk.cyan(result.user.username));
      console.log(chalk.gray('Role:'), chalk.yellow(result.user.role));
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('Login failed'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },

  async logout() {
    const spinner = ora('Logging out...').start();

    try {
      api.clearToken();
      spinner.succeed(chalk.green('Logged out successfully'));
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('Logout failed'));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  },
};
