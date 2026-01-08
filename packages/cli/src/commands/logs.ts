import chalk from 'chalk';
import { api } from '../lib/api';
import { io } from 'socket.io-client';

export const logsCommands = {
  async show(options: any) {
    if (options.follow) {
      console.log(chalk.cyan('\n📜 Following logs (Press Ctrl+C to stop)\n'));

      const socket = io('http://localhost:3000');

      socket.on('connect', () => {
        console.log(chalk.green('Connected\n'));
      });

      socket.on('system:log', (log: any) => {
        if (options.level && log.level !== options.level) {
          return;
        }

        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        const level = formatLevel(log.level);
        const source = chalk.cyan(log.source.padEnd(20));
        const message = log.message;

        console.log(`${chalk.gray(timestamp)} ${level} ${source} ${message}`);
      });

      socket.on('disconnect', () => {
        console.log(chalk.red('\nDisconnected'));
        process.exit(0);
      });

      process.on('SIGINT', () => {
        console.log(chalk.yellow('\nStopping...'));
        socket.disconnect();
        process.exit(0);
      });

    } else {
      try {
        const logs = await api.getLogs({
          limit: options.lines,
          level: options.level,
        });

        console.log(chalk.cyan(`\n📜 Logs (last ${options.lines})\n`));

        logs.forEach((log: any) => {
          const timestamp = new Date(log.createdAt).toLocaleTimeString();
          const level = formatLevel(log.level);
          const source = chalk.cyan(log.source.padEnd(20));
          const message = log.message;

          console.log(`${chalk.gray(timestamp)} ${level} ${source} ${message}`);
        });

        console.log();

      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    }
  },
};

function formatLevel(level: string): string {
  switch (level) {
    case 'ERROR':
      return chalk.red('[ERROR]');
    case 'WARN':
      return chalk.yellow('[WARN ]');
    case 'INFO':
    default:
      return chalk.green('[INFO ]');
  }
}
