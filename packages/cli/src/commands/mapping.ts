import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { api } from '../lib/api';
import Table from 'cli-table3';

export const mappingCommands = {
  async list() {
    const spinner = ora('Loading mappings...').start();

    try {
      const mappings = await api.getMappings();
      spinner.stop();

      if (mappings.length === 0) {
        console.log(chalk.yellow('\nNo mappings found.\n'));
        return;
      }

      console.log('\n' + chalk.cyan.bold('TAG MAPPINGS'));
      console.log(chalk.gray('─'.repeat(120)));

      const table = new Table({
        head: [
          chalk.cyan('Input Tag'),
          chalk.cyan('Input PLC'),
          chalk.cyan('→'),
          chalk.cyan('Output Tag'),
          chalk.cyan('Output PLC'),
          chalk.cyan('Transform'),
          chalk.cyan('Status'),
        ],
        colWidths: [20, 20, 3, 20, 20, 15, 10],
      });

      mappings.forEach((mapping: any) => {
        const transform =
          mapping.scaleFactor === 1 && mapping.offset === 0
            ? chalk.gray('1:1')
            : `×${mapping.scaleFactor} +${mapping.offset}`;

        table.push([
          mapping.inputTag.name,
          mapping.inputTag.plc.name,
          chalk.magenta('→'),
          mapping.outputTagName,
          mapping.outputPlc.name,
          transform,
          mapping.enabled ? chalk.green('● ON') : chalk.gray('○ OFF'),
        ]);
      });

      console.log(table.toString());
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('Failed to load mappings'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },

  async create(options: any) {
    const spinner = ora('Creating mapping...').start();

    try {
      const mapping = await api.createMapping({
        inputTagId: options.input,
        outputPlcId: options.output,
        outputTagName: options.name,
        outputAddress: options.address,
        scaleFactor: parseFloat(options.scale),
        offset: parseFloat(options.offset),
      });

      spinner.succeed(chalk.green('Mapping created successfully'));
      console.log(chalk.gray('\nMapping ID:'), mapping.id);
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('Failed to create mapping'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },

  async delete(id: string) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.yellow('Delete this mapping?'),
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.gray('Cancelled.'));
      return;
    }

    const spinner = ora('Deleting mapping...').start();

    try {
      await api.deleteMapping(id);
      spinner.succeed(chalk.green('Mapping deleted successfully'));
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to delete mapping'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },
};
