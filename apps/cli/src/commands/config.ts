import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.narrative-os');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

interface Config {
  provider: 'openai' | 'deepseek';
  apiKey: string;
  model: string;
}

const PROVIDERS = [
  { name: 'OpenAI', value: 'openai', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  { name: 'DeepSeek', value: 'deepseek', models: ['deepseek-chat', 'deepseek-reasoner'] },
];

const DEEPSEEK_MODEL_MAP: Record<string, string> = {
  'deepseek-chat': 'deepseek-chat',
  'deepseek-reasoner': 'deepseek-reasoner',
};

function loadConfig(): Config | null {
  if (!existsSync(CONFIG_FILE)) return null;
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

function saveConfig(config: Config) {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function configCommand(showOnly = false) {
  const existing = loadConfig();

  // Show current configuration
  if (showOnly) {
    if (!existing) {
      console.log('❌ No configuration found.');
      console.log('Run: nos config  to set up your LLM provider');
      return;
    }

    console.log('\n📋 Current Configuration:');
    console.log('========================');
    console.log(`Provider: ${existing.provider}`);
    console.log(`Model:    ${existing.model}`);
    console.log(`API Key:  ${existing.apiKey ? '✅ Set (' + '*'.repeat(Math.min(existing.apiKey.length - 4, 8)) + existing.apiKey.slice(-4) + ')' : '❌ Not set'}`);
    console.log('');
    console.log(`Config file: ${CONFIG_FILE}`);
    return;
  }

  // Interactive configuration
  const { select, password } = await import('@inquirer/prompts');

  const provider = await select({
    message: 'Select LLM provider:',
    choices: PROVIDERS.map(p => ({ name: p.name, value: p.value })),
    default: existing?.provider,
  });

  const providerInfo = PROVIDERS.find(p => p.value === provider)!;

  const model = await select({
    message: 'Select model:',
    choices: providerInfo.models.map(m => ({ name: m, value: m })),
    default: existing?.model || providerInfo.models[0],
  });

  const apiKey = await password({
    message: `Enter ${providerInfo.name} API key:`,
    mask: '*',
  });

  const config: Config = { provider: provider as 'openai' | 'deepseek', model, apiKey };
  saveConfig(config);

  console.log(`\n✅ Configuration saved for ${providerInfo.name}`);
  console.log(`Model: ${model}`);
}

export function getConfig(): Config | null {
  return loadConfig();
}

export function applyConfig() {
  const config = loadConfig();
  if (config) {
    process.env.LLM_PROVIDER = config.provider;
    process.env.LLM_MODEL = config.model;
    if (config.provider === 'openai') {
      process.env.OPENAI_API_KEY = config.apiKey;
    } else if (config.provider === 'deepseek') {
      process.env.DEEPSEEK_API_KEY = config.apiKey;
    }
  }
}
