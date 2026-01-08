import chalk from 'chalk';
import ora from 'ora';
import { api } from '../lib/api';
import Table from 'cli-table3';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const systemCommands = {
  async status() {
    const spinner = ora('Checking system status...').start();

    try {
      const health = await api.health();
      const plcs = await api.getPlcs();
      const mappings = await api.getMappings();

      spinner.succeed(chalk.green('System is operational'));

      console.log('\n' + chalk.cyan.bold('SYSTEM STATUS'));
      console.log(chalk.gray('─'.repeat(60)));

      const table = new Table({
        head: [chalk.cyan('Metric'), chalk.cyan('Value')],
        colWidths: [30, 30],
      });

      table.push(
        ['Status', chalk.green('● RUNNING')],
        ['Uptime', health.timestamp || 'Unknown'],
        ['Input PLCs', plcs.filter((p: any) => p.type === 'INPUT').length],
        ['Output PLCs', plcs.filter((p: any) => p.type === 'OUTPUT').length],
        ['Active Mappings', mappings.filter((m: any) => m.enabled).length],
        ['Total Tags', plcs.reduce((sum: number, p: any) => sum + (p._count?.tags || 0), 0)]
      );

      console.log(table.toString());
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('System is offline or unreachable'));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  },

  async start(options: any) {
    console.log(chalk.cyan('\n🚀 Starting Industrial Gateway Platform...\n'));

    const backendPath = path.join(process.cwd(), 'packages', 'backend');

    if (!fs.existsSync(backendPath)) {
      console.error(chalk.red('Error: Backend not found at'), backendPath);
      process.exit(1);
    }

    if (options.daemon) {
      console.log(chalk.yellow('Starting in daemon mode...'));
      console.log(chalk.gray('Use systemd service for production deployment\n'));

      const child = spawn('npm', ['run', 'dev'], {
        cwd: backendPath,
        detached: true,
        stdio: 'ignore',
      });

      child.unref();
      console.log(chalk.green('✓ Gateway started in background'));
      console.log(chalk.gray(`  PID: ${child.pid}`));
    } else {
      console.log(chalk.yellow('Starting in foreground mode...\n'));

      const child = spawn('npm', ['run', 'dev'], {
        cwd: backendPath,
        stdio: 'inherit',
      });

      child.on('exit', (code) => {
        if (code !== 0) {
          console.error(chalk.red(`\nGateway exited with code ${code}`));
          process.exit(code || 1);
        }
      });
    }
  },

  async stop() {
    console.log(chalk.yellow('\n🛑 Stopping Industrial Gateway Platform...\n'));
    console.log(chalk.gray('Use systemctl stop industrial-gateway for systemd deployments'));
    console.log(chalk.gray('Or kill the process manually: pkill -f "industrial-gateway"\n'));
  },

  async restart() {
    console.log(chalk.cyan('\n🔄 Restarting Industrial Gateway Platform...\n'));
    await systemCommands.stop();
    setTimeout(async () => {
      await systemCommands.start({});
    }, 2000);
  },

  async health() {
    const spinner = ora('Checking health...').start();

    try {
      const health = await api.health();
      spinner.succeed(chalk.green('System healthy'));

      console.log(chalk.gray('\nResponse:'));
      console.log(JSON.stringify(health, null, 2));
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('Health check failed'));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  },

  async demo() {
    console.log(chalk.cyan('Demo mode activated!\n'));
    console.log(chalk.yellow('Sample PLCs are already configured in the database.'));
    console.log(chalk.gray('\nQuick commands to explore:'));
    console.log(chalk.green('  igp plc list') + chalk.gray('           - List all PLCs'));
    console.log(chalk.green('  igp tui') + chalk.gray('                - Launch Terminal UI'));
    console.log(chalk.green('  igp logs -f') + chalk.gray('            - Follow logs'));
    console.log();
  },
};
