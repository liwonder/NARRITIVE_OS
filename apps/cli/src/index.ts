#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { generateCommand } from './commands/generate.js';
import { statusCommand } from './commands/status.js';
import { configCommand, applyConfig } from './commands/config.js';

applyConfig();

const program = new Command();

program
  .name('nos')
  .description('Narrative OS - AI-powered story generation')
  .version('0.1.0');

program
  .command('config')
  .description('Configure LLM provider and API key')
  .action(configCommand);

program
  .command('init')
  .description('Create a new story')
  .option('-t, --title <title>', 'Story title')
  .option('--theme <theme>', 'Story theme')
  .option('-g, --genre <genre>', 'Genre')
  .option('-s, --setting <setting>', 'Setting')
  .option('--tone <tone>', 'Tone')
  .option('-p, --premise <premise>', 'Story premise')
  .option('-c, --chapters <number>', 'Target chapter count', '5')
  .action(initCommand);

program
  .command('generate <story-id>')
  .description('Generate the next chapter')
  .action(generateCommand);

program
  .command('status [story-id]')
  .description('Show story status (or list all stories)')
  .action(statusCommand);

program
  .command('continue <story-id>')
  .description('Generate all remaining chapters')
  .action(async (storyId: string) => {
    const { continueCommand } = await import('./commands/continue.js');
    await continueCommand(storyId);
  });

program.parse();
