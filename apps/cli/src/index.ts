#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { generateCommand } from './commands/generate.js';
import { statusCommand } from './commands/status.js';
import { configCommand, applyConfig } from './commands/config.js';
import { listCommand } from './commands/list.js';
import { deleteCommand } from './commands/delete.js';
import { cloneCommand } from './commands/clone.js';
import { exportCommand } from './commands/export.js';
import { readCommand } from './commands/read.js';
import { bibleCommand } from './commands/bible.js';
import { stateCommand } from './commands/state.js';
import { showHint, showWelcome } from './commands/hint.js';
import { versionCommand } from './commands/version.js';
import { useCommand, getCurrentStoryId, resolveStoryId } from './commands/use.js';

applyConfig();

const program = new Command();

program
  .name('nos')
  .description('Narrative OS - AI-powered story generation')
  .version('0.1.0');

// Show welcome when no args provided
if (process.argv.length <= 2) {
  showWelcome();
  process.exit(0);
}

// Configuration
program
  .command('config')
  .description('Configure LLM provider and API key')
  .option('-s, --show', 'Show current configuration')
  .action((options: { show?: boolean }) => {
    configCommand(options.show);
  });

// Story Management
program
  .command('init')
  .description('Create a new story')
  .option('-t, --title <title>', 'Story title')
  .option('--theme <theme>', 'Story theme')
  .option('-g, --genre <genre>', 'Genre')
  .option('-s, --setting <setting>', 'Setting')
  .option('--tone <tone>', 'Tone')
  .option('-p, --premise <premise>', 'Story premise')
  .option('-c, --chapters <number>', 'Target chapter count')
  .action(initCommand);

program
  .command('list')
  .alias('ls')
  .description('List all stories')
  .action(listCommand);

program
  .command('use [story-id]')
  .description('Set or show active story')
  .action((storyId?: string) => {
    useCommand(storyId || null);
  });

program
  .command('status [story-id]')
  .description('Show story status (or list all stories)')
  .action((storyId?: string) => {
    statusCommand(resolveStoryId(storyId));
  });

program
  .command('delete <story-id>')
  .description('Delete a story')
  .option('-f, --force', 'Skip confirmation')
  .action((storyId: string, options: { force?: boolean }) => {
    deleteCommand(storyId, options.force);
  });

program
  .command('clone <story-id> <new-title>')
  .description('Clone a story as a template')
  .action(cloneCommand);

// Generation
program
  .command('generate [story-id]')
  .alias('gen')
  .description('Generate the next chapter')
  .action((storyId?: string) => {
    generateCommand(resolveStoryId(storyId));
  });

program
  .command('continue [story-id]')
  .description('Generate all remaining chapters')
  .action(async (storyId?: string) => {
    const { continueCommand } = await import('./commands/continue.js');
    await continueCommand(resolveStoryId(storyId));
  });

program
  .command('regenerate <story-id> <chapter-number>')
  .alias('regen')
  .description('Regenerate a specific chapter')
  .action(async (storyId: string, chapterNum: string) => {
    const { regenerateCommand } = await import('./commands/regenerate.js');
    await regenerateCommand(storyId, parseInt(chapterNum));
  });

// Reading & Export
program
  .command('read [story-id] [chapter-number]')
  .description('Read chapter content (or list chapters)')
  .action((storyId?: string, chapterNum?: string) => {
    readCommand(resolveStoryId(storyId), chapterNum ? parseInt(chapterNum) : undefined);
  });

program
  .command('export [story-id]')
  .description('Export story to file')
  .option('-f, --format <format>', 'Export format (markdown|txt)', 'markdown')
  .option('-o, --output <file>', 'Output filename')
  .action((storyId?: string, options?: { format?: string; output?: string }) => {
    exportCommand(resolveStoryId(storyId), options?.format, options?.output);
  });

// Bible & State
program
  .command('bible [story-id]')
  .description('View story bible (characters, setting, etc.)')
  .action((storyId?: string) => {
    bibleCommand(resolveStoryId(storyId));
  });

program
  .command('state [story-id]')
  .description('View structured story state')
  .action((storyId?: string) => {
    stateCommand(resolveStoryId(storyId));
  });

program
  .command('memories [story-id] [query]')
  .description('Search narrative memories')
  .action(async (storyId?: string, query?: string) => {
    const { memoriesCommand } = await import('./commands/memories.js');
    await memoriesCommand(resolveStoryId(storyId), query);
  });

program
  .command('validate [story-id]')
  .description('Validate story consistency')
  .action(async (storyId?: string) => {
    const { validateCommand } = await import('./commands/validate.js');
    await validateCommand(resolveStoryId(storyId));
  });

program
  .command('hint [story-id]')
  .description('Show helpful hints and suggestions')
  .action((storyId?: string) => {
    showHint({ storyId: storyId || getCurrentStoryId() || undefined });
  });

program
  .command('version')
  .alias('v')
  .description('Show version information')
  .action(versionCommand);

program.parse();
