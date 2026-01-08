#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';
import { systemCommands } from './commands/system';
import { plcCommands } from './commands/plc';
import { tagCommands } from './commands/tag';
import { mappingCommands } from './commands/mapping';
import { logsCommands } from './commands/logs';
import { authCommands } from './commands/auth';

const program = new Command();

// ASCII Art Banner
const banner = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${chalk.cyan('🏭 INDUSTRIAL GATEWAY PLATFORM')}                      ║
║   ${chalk.green('Command Line Interface & Terminal UI')}              ║
║                                                           ║
║   Version: ${chalk.yellow(version)}                                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

program
  .name('igp')
  .description('Industrial Gateway Platform - Universal PLC Gateway & Emulator')
  .version(version)
  .addHelpText('beforeAll', banner);

// System Commands
program
  .command('status')
  .description('Show system status')
  .action(systemCommands.status);

program
  .command('start')
  .description('Start the gateway server')
  .option('-d, --daemon', 'Run as daemon')
  .action(systemCommands.start);

program
  .command('stop')
  .description('Stop the gateway server')
  .action(systemCommands.stop);

program
  .command('restart')
  .description('Restart the gateway server')
  .action(systemCommands.restart);

program
  .command('tui')
  .description('Launch Terminal UI dashboard')
  .action(async () => {
    const { launchTUI } = await import('./tui');
    launchTUI();
  });

// PLC Commands
const plc = program.command('plc').description('Manage PLCs');

plc
  .command('list')
  .description('List all PLCs')
  .option('-t, --type <type>', 'Filter by type (INPUT|OUTPUT)')
  .action(plcCommands.list);

plc
  .command('create')
  .description('Create a new PLC')
  .option('-n, --name <name>', 'PLC name')
  .option('-b, --brand <brand>', 'PLC brand')
  .option('-p, --protocol <protocol>', 'Protocol')
  .option('-t, --type <type>', 'Type (INPUT|OUTPUT)')
  .action(plcCommands.create);

plc
  .command('start <id>')
  .description('Start a PLC')
  .action(plcCommands.start);

plc
  .command('stop <id>')
  .description('Stop a PLC')
  .action(plcCommands.stop);

plc
  .command('delete <id>')
  .description('Delete a PLC')
  .action(plcCommands.delete);

plc
  .command('info <id>')
  .description('Show PLC details')
  .action(plcCommands.info);

// Tag Commands
const tag = program.command('tag').description('Manage tags');

tag
  .command('list <plcId>')
  .description('List tags for a PLC')
  .action(tagCommands.list);

tag
  .command('create')
  .description('Create a new tag')
  .requiredOption('-p, --plc <plcId>', 'PLC ID')
  .requiredOption('-n, --name <name>', 'Tag name')
  .requiredOption('-a, --address <address>', 'Tag address')
  .option('-t, --type <type>', 'Data type', 'FLOAT')
  .option('-u, --unit <unit>', 'Unit of measurement')
  .option('-s, --signal <signal>', 'Signal type (SINE|RAMP|RANDOM|DIGITAL)', 'SINE')
  .action(tagCommands.create);

tag
  .command('watch <tagId>')
  .description('Watch tag value in real-time')
  .action(tagCommands.watch);

// Mapping Commands
const mapping = program.command('mapping').description('Manage tag mappings');

mapping
  .command('list')
  .description('List all mappings')
  .action(mappingCommands.list);

mapping
  .command('create')
  .description('Create a new mapping')
  .requiredOption('-i, --input <tagId>', 'Input tag ID')
  .requiredOption('-o, --output <plcId>', 'Output PLC ID')
  .requiredOption('-n, --name <name>', 'Output tag name')
  .requiredOption('-a, --address <address>', 'Output address')
  .option('-s, --scale <factor>', 'Scale factor', '1.0')
  .option('--offset <offset>', 'Offset value', '0.0')
  .action(mappingCommands.create);

mapping
  .command('delete <id>')
  .description('Delete a mapping')
  .action(mappingCommands.delete);

// Logs Commands
program
  .command('logs')
  .description('Show system logs')
  .option('-f, --follow', 'Follow log output')
  .option('-n, --lines <number>', 'Number of lines', '50')
  .option('-l, --level <level>', 'Filter by level (INFO|WARN|ERROR)')
  .action(logsCommands.show);

// Auth Commands
program
  .command('login')
  .description('Login to the system')
  .action(authCommands.login);

program
  .command('logout')
  .description('Logout from the system')
  .action(authCommands.logout);

// Quick actions
program
  .command('demo')
  .description('Start demo with sample data')
  .action(async () => {
    console.log(chalk.cyan('\n🎬 Starting demo mode...\n'));
    await systemCommands.demo();
  });

program
  .command('health')
  .description('Check system health')
  .action(systemCommands.health);

// Error handling
program.exitOverride();

try {
  program.parse(process.argv);
} catch (error: any) {
  if (error.code === 'commander.helpDisplayed') {
    process.exit(0);
  }
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
}

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
