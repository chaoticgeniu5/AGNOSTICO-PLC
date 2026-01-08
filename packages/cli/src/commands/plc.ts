import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { api } from '../lib/api';
import Table from 'cli-table3';

const BRANDS = [
  { value: 'SIEMENS', label: 'Siemens', protocol: 'S7COMM' },
  { value: 'ALLEN_BRADLEY', label: 'Allen-Bradley', protocol: 'ETHERNET_IP' },
  { value: 'SCHNEIDER', label: 'Schneider', protocol: 'MODBUS_TCP' },
  { value: 'OMRON', label: 'Omron', protocol: 'FINS' },
  { value: 'GENERIC', label: 'Generic', protocol: 'MODBUS_RTU' },
];

export const plcCommands = {
  async list(options: any) {
    const spinner = ora('Loading PLCs...').start();

    try {
      const plcs = await api.getPlcs(options.type);
      spinner.stop();

      if (plcs.length === 0) {
        console.log(chalk.yellow('\nNo PLCs found.\n'));
        return;
      }

      console.log('\n' + chalk.cyan.bold('PLCs'));
      console.log(chalk.gray('─'.repeat(100)));

      const table = new Table({
        head: [
          chalk.cyan('ID'),
          chalk.cyan('Name'),
          chalk.cyan('Brand'),
          chalk.cyan('Protocol'),
          chalk.cyan('Type'),
          chalk.cyan('Status'),
          chalk.cyan('Tags'),
        ],
        colWidths: [15, 25, 15, 15, 10, 12, 8],
      });

      plcs.forEach((plc: any) => {
        const brand = BRANDS.find((b) => b.value === plc.brand);
        table.push([
          plc.id.substring(0, 12) + '...',
          plc.name,
          brand?.label || plc.brand,
          plc.protocol,
          plc.type,
          plc.enabled ? chalk.green('● RUNNING') : chalk.gray('○ STOPPED'),
          plc._count?.tags || 0,
        ]);
      });

      console.log(table.toString());
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('Failed to load PLCs'));
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  },

  async create(options: any) {
    console.log(chalk.cyan('\n📝 Create New PLC\n'));

    let answers: any = {};

    if (!options.name || !options.brand || !options.type) {
      answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'PLC Name:',
          default: options.name,
          validate: (input) => input.length > 0 || 'Name is required',
        },
        {
          type: 'list',
          name: 'brand',
          message: 'Select Brand:',
          choices: BRANDS.map((b) => ({ name: `${b.label} (${b.protocol})`, value: b.value })),
          default: options.brand,
        },
        {
          type: 'list',
          name: 'type',
          message: 'PLC Type:',
          choices: [
            { name: 'Input (Simulator)', value: 'INPUT' },
            { name: 'Output (Emulator)', value: 'OUTPUT' },
          ],
          default: options.type,
        },
      ]);
    } else {
      answers = options;
    }

    const brand = BRANDS.find((b) => b.value === answers.brand);

    const spinner = ora('Creating PLC...').start();

    try {
      const plc = await api.createPlc({
        name: answers.name,
        brand: answers.brand,
        protocol: brand?.protocol,
        type: answers.type,
      });

      spinner.succeed(chalk.green('PLC created successfully'));

      console.log(chalk.gray('\nDetails:'));
      console.log(chalk.cyan('  ID:'), plc.id);
      console.log(chalk.cyan('  Name:'), plc.name);
      console.log(chalk.cyan('  Type:'), plc.type);
      console.log();

      const { shouldStart } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldStart',
          message: 'Start this PLC now?',
          default: true,
        },
      ]);

      if (shouldStart) {
        await plcCommands.start(plc.id);
      }

    } catch (error: any) {
      spinner.fail(chalk.red('Failed to create PLC'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },

  async start(id: string) {
    const spinner = ora('Starting PLC...').start();

    try {
      await api.startPlc(id);
      spinner.succeed(chalk.green(`PLC started successfully`));
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to start PLC'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },

  async stop(id: string) {
    const spinner = ora('Stopping PLC...').start();

    try {
      await api.stopPlc(id);
      spinner.succeed(chalk.green(`PLC stopped successfully`));
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to stop PLC'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },

  async delete(id: string) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.yellow('Are you sure you want to delete this PLC?'),
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.gray('Cancelled.'));
      return;
    }

    const spinner = ora('Deleting PLC...').start();

    try {
      await api.deletePlc(id);
      spinner.succeed(chalk.green('PLC deleted successfully'));
    } catch (error: any) {
      spinner.fail(chalk.red('Failed to delete PLC'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },

  async info(id: string) {
    const spinner = ora('Loading PLC details...').start();

    try {
      const plc = await api.getPlc(id);
      spinner.stop();

      console.log('\n' + chalk.cyan.bold('PLC DETAILS'));
      console.log(chalk.gray('─'.repeat(60)));

      const table = new Table({
        head: [chalk.cyan('Property'), chalk.cyan('Value')],
        colWidths: [20, 40],
      });

      const brand = BRANDS.find((b) => b.value === plc.brand);

      table.push(
        ['ID', plc.id],
        ['Name', plc.name],
        ['Brand', brand?.label || plc.brand],
        ['Protocol', plc.protocol],
        ['Type', plc.type],
        ['Status', plc.enabled ? chalk.green('● RUNNING') : chalk.gray('○ STOPPED')],
        ['Tags', plc.tags?.length || 0],
        ['Mappings', plc.mappings?.length || 0],
        ['Endpoint', plc.endpoint || chalk.gray('N/A')],
        ['Created', new Date(plc.createdAt).toLocaleString()]
      );

      console.log(table.toString());

      if (plc.tags && plc.tags.length > 0) {
        console.log('\n' + chalk.cyan.bold('TAGS'));
        console.log(chalk.gray('─'.repeat(60)));

        const tagTable = new Table({
          head: [chalk.cyan('Name'), chalk.cyan('Address'), chalk.cyan('Value'), chalk.cyan('Unit')],
          colWidths: [20, 15, 15, 10],
        });

        plc.tags.slice(0, 10).forEach((tag: any) => {
          tagTable.push([tag.name, tag.address, tag.value.toFixed(2), tag.unit || '-']);
        });

        console.log(tagTable.toString());

        if (plc.tags.length > 10) {
          console.log(chalk.gray(`\n... and ${plc.tags.length - 10} more tags`));
        }
      }

      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('Failed to load PLC'));
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
      process.exit(1);
    }
  },
};
