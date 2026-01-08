import chalk from 'chalk';
import ora from 'ora';
import { api } from '../lib/api';
import Table from 'cli-table3';
import { io } from 'socket.io-client';

export const tagCommands = {
  async list(plcId: string) {
    const spinner = ora('Loading tags...').start();

    try {
      const tags = await api.getTags(plcId);
      spinner.stop();

      if (tags.length === 0) {
        console.log(chalk.yellow('\nNo tags found for this PLC.\n'));
        return;
      }

      console.log('\n' + chalk.cyan.bold('TAGS'));
      console.log(chalk.gray('─'.repeat(100)));

      const table = new Table({
        head: [
          chalk.cyan('Name'),
          chalk.cyan('Address'),
          chalk.cyan('Value'),
          chalk.cyan('Unit'),
          chalk.cyan('Signal'),
          chalk.cyan('Quality'),
        ],
        colWidths: [25, 15, 12, 10, 12, 12],
      });

      tags.forEach((tag: any) => {
        table.push([
          tag.name,
          tag.address,
          tag.value.toFixed(2),
          tag.unit || '-',
          tag.signalType || '-',
          tag.quality === 'GOOD' ? chalk.green(tag.quality) : chalk.yellow(tag.quality),
        ]);
      });

      console.log(table.toString());
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('Failed to load tags'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },

  async create(options: any) {
    const spinner = ora('Creating tag...').start();

    try {
      const tag = await api.createTag({
        plcId: options.plc,
        name: options.name,
        address: options.address,
        dataType: options.type,
        unit: options.unit,
        signalType: options.signal,
      });

      spinner.succeed(chalk.green('Tag created successfully'));
      console.log(chalk.gray('\nTag ID:'), tag.id);
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('Failed to create tag'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },

  async watch(tagId: string) {
    console.log(chalk.cyan('\n👁  Watching tag (Press Ctrl+C to stop)\n'));

    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log(chalk.green('Connected to server\n'));
    });

    socket.on('tag:update', (data: any) => {
      if (data.tagId === tagId) {
        const timestamp = new Date(data.timestamp).toLocaleTimeString();
        console.log(
          `${chalk.gray(timestamp)} ${chalk.cyan(data.tagName)}: ${chalk.yellow(
            data.value.toFixed(3)
          )} ${chalk.gray(data.quality)}`
        );
      }
    });

    socket.on('disconnect', () => {
      console.log(chalk.red('\nDisconnected from server'));
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log(chalk.yellow('\nStopping...'));
      socket.disconnect();
      process.exit(0);
    });
  },
};
