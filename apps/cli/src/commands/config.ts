import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.narrative-os');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

// Multi-model configuration interface
interface ModelConfig {
  name: string;
  provider: 'openai' | 'deepseek';
  apiKey: string;
  baseURL?: string;
  model: string;
  purpose: 'reasoning' | 'chat' | 'fast';
}

interface MultiModelConfig {
  models: ModelConfig[];
  defaultModel: string;
}

// Legacy single-model config for backward compatibility
interface LegacyConfig {
  provider: 'openai' | 'deepseek';
  apiKey: string;
  model: string;
}

type Config = LegacyConfig | MultiModelConfig;

const PROVIDERS = [
  { name: 'OpenAI', value: 'openai', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  { name: 'DeepSeek', value: 'deepseek', models: ['deepseek-chat', 'deepseek-reasoner'] },
];

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

function isMultiModelConfig(config: Config): config is MultiModelConfig {
  return 'models' in config && Array.isArray((config as MultiModelConfig).models);
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
    
    if (isMultiModelConfig(existing)) {
      console.log(`Mode: Multi-Model (${existing.models.length} models configured)`);
      console.log('');
      for (const model of existing.models) {
        const apiKeyDisplay = model.apiKey 
          ? '✅ Set (' + '*'.repeat(Math.min(model.apiKey.length - 4, 8)) + model.apiKey.slice(-4) + ')' 
          : '❌ Not set';
        console.log(`  [${model.purpose.toUpperCase()}] ${model.name}`);
        console.log(`    Provider: ${model.provider}`);
        console.log(`    Model: ${model.model}`);
        console.log(`    API Key: ${apiKeyDisplay}`);
        console.log('');
      }
    } else {
      console.log(`Mode: Single Model`);
      console.log(`Provider: ${existing.provider}`);
      console.log(`Model: ${existing.model}`);
      console.log(`API Key: ${existing.apiKey ? '✅ Set (' + '*'.repeat(Math.min(existing.apiKey.length - 4, 8)) + existing.apiKey.slice(-4) + ')' : '❌ Not set'}`);
    }
    console.log(`Config file: ${CONFIG_FILE}`);
    return;
  }

  // Interactive configuration
  const { select, password, confirm } = await import('@inquirer/prompts');

  const useMultiModel = await confirm({
    message: 'Configure multiple models (reasoning + chat)?',
    default: true,
  });

  if (useMultiModel) {
    // Multi-model configuration
    const provider = await select({
      message: 'Select LLM provider:',
      choices: PROVIDERS.map(p => ({ name: p.name, value: p.value })),
    });

    const providerInfo = PROVIDERS.find(p => p.value === provider)!;

    const apiKey = await password({
      message: `Enter ${providerInfo.name} API key:`,
      mask: '*',
    });

    const reasoningModel = await select({
      message: 'Select REASONING model (for generation/planning):',
      choices: providerInfo.models.map(m => ({ name: m, value: m })),
      default: provider === 'deepseek' ? 'deepseek-reasoner' : 'gpt-4o',
    });

    const chatModel = await select({
      message: 'Select CHAT model (for validation/summarization):',
      choices: providerInfo.models.map(m => ({ name: m, value: m })),
      default: provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini',
    });

    const baseURL = provider === 'deepseek' ? 'https://api.deepseek.com' : undefined;

    const config: MultiModelConfig = {
      models: [
        {
          name: 'reasoning',
          provider: provider as 'openai' | 'deepseek',
          apiKey,
          baseURL,
          model: reasoningModel,
          purpose: 'reasoning',
        },
        {
          name: 'chat',
          provider: provider as 'openai' | 'deepseek',
          apiKey,
          baseURL,
          model: chatModel,
          purpose: 'chat',
        },
      ],
      defaultModel: 'chat',
    };

    saveConfig(config);

    console.log(`\n✅ Multi-model configuration saved!`);
    console.log(`  Reasoning: ${reasoningModel}`);
    console.log(`  Chat: ${chatModel}`);
  } else {
    // Single model configuration (legacy)
    const provider = await select({
      message: 'Select LLM provider:',
      choices: PROVIDERS.map(p => ({ name: p.name, value: p.value })),
      default: (existing as LegacyConfig)?.provider,
    });

    const providerInfo = PROVIDERS.find(p => p.value === provider)!;

    const model = await select({
      message: 'Select model:',
      choices: providerInfo.models.map(m => ({ name: m, value: m })),
      default: (existing as LegacyConfig)?.model || providerInfo.models[0],
    });

    const apiKey = await password({
      message: `Enter ${providerInfo.name} API key:`,
      mask: '*',
    });

    const config: LegacyConfig = { provider: provider as 'openai' | 'deepseek', model, apiKey };
    saveConfig(config);

    console.log(`\n✅ Configuration saved for ${providerInfo.name}`);
    console.log(`Model: ${model}`);
  }
}

export function getConfig(): Config | null {
  return loadConfig();
}

export function applyConfig() {
  const config = loadConfig();
  if (!config) return;

  if (isMultiModelConfig(config)) {
    // Set multi-model config as environment variable
    process.env.LLM_MODELS_CONFIG = JSON.stringify(config);
    
    // Also set individual API keys for backward compatibility
    for (const model of config.models) {
      if (model.provider === 'openai') {
        process.env.OPENAI_API_KEY = model.apiKey;
      } else if (model.provider === 'deepseek') {
        process.env.DEEPSEEK_API_KEY = model.apiKey;
      }
    }
  } else {
    // Legacy single-model config
    process.env.LLM_PROVIDER = config.provider;
    process.env.LLM_MODEL = config.model;
    if (config.provider === 'openai') {
      process.env.OPENAI_API_KEY = config.apiKey;
    } else if (config.provider === 'deepseek') {
      process.env.DEEPSEEK_API_KEY = config.apiKey;
    }
  }
}
