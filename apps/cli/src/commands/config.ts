import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.narrative-os');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const MODELS_CACHE_FILE = join(CONFIG_DIR, 'models-cache.json');

const MODELS_REMOTE_URL = 'https://raw.githubusercontent.com/liwonder/NARRITIVE_OS/master/models.json';
const MODELS_CACHE_TTL = 24 * 60 * 60 * 1000;

type TaskType = 'simple' | 'reasoning' | 'embedding';

interface TaskModelConfig {
  provider: 'openai' | 'deepseek' | 'alibaba' | 'ark';
  apiKey: string;
  baseURL?: string;
  model: string;
}

interface TaskBasedConfig {
  version: 2;
  tasks: Record<TaskType, TaskModelConfig>;
}

interface ModelConfig {
  name: string;
  provider: 'openai' | 'deepseek' | 'alibaba' | 'ark';
  apiKey: string;
  baseURL?: string;
  model: string;
  purpose: 'reasoning' | 'chat' | 'fast' | 'embedding';
}

interface MultiModelConfig {
  models: ModelConfig[];
  defaultModel: string;
}

interface LegacyConfig {
  provider: 'openai' | 'deepseek' | 'alibaba' | 'ark';
  apiKey: string;
  model: string;
}

type Config = TaskBasedConfig | MultiModelConfig | LegacyConfig;

interface RemoteProviderEntry {
  models: string[];
  deprecated?: string[];
  baseURL?: string;
}

interface RemoteModelsConfig {
  version: string;
  updatedAt: string;
  providers: Record<string, RemoteProviderEntry>;
}

const BUILTIN_PROVIDERS = [
  { 
    name: 'OpenAI', 
    value: 'openai', 
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'text-embedding-3-small'],
    baseURL: undefined as string | undefined
  },
  { 
    name: 'DeepSeek', 
    value: 'deepseek', 
    models: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'],
    baseURL: 'https://api.deepseek.com'
  },
  { 
    name: 'Alibaba Cloud (Qwen)', 
    value: 'alibaba', 
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'text-embedding-v3'],
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  },
  { 
    name: 'ByteDance Ark', 
    value: 'ark', 
    models: ['doubao-pro-128k', 'doubao-lite-128k', 'doubao-embedding'],
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
  },
];

type ProviderEntry = typeof BUILTIN_PROVIDERS[number];

let PROVIDERS: ProviderEntry[] = BUILTIN_PROVIDERS.map(p => ({ ...p, models: [...p.models] }));

const TASK_DESCRIPTIONS: Record<TaskType, { title: string; description: string; examples: string }> = {
  simple: {
    title: '📝 Simple/Chat Tasks',
    description: 'Fast, lightweight tasks',
    examples: 'Validation, summarization, simple queries'
  },
  reasoning: {
    title: '🧠 Reasoning Tasks',
    description: 'Complex generation and planning',
    examples: 'Story generation, scene planning, character decisions'
  },
  embedding: {
    title: '🔍 Embedding Tasks',
    description: 'Vector embeddings for memory',
    examples: 'Storing and retrieving story memories'
  }
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

function isTaskBasedConfig(config: Config): config is TaskBasedConfig {
  return 'version' in config && config.version === 2;
}

function isMultiModelConfig(config: Config): config is MultiModelConfig {
  return 'models' in config && Array.isArray((config as MultiModelConfig).models);
}

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '❌ Not set';
  return '✅ ' + '*'.repeat(Math.min(key.length - 4, 12)) + key.slice(-4);
}

// ── Remote Model Registry ──────────────────────────────────────────

async function fetchRemoteModels(): Promise<RemoteModelsConfig | null> {
  try {
    const response = await fetch(MODELS_REMOTE_URL, { 
      signal: AbortSignal.timeout(5000) 
    });
    if (!response.ok) return null;
    return await response.json() as RemoteModelsConfig;
  } catch {
    return null;
  }
}

function loadCachedModels(): RemoteModelsConfig | null {
  if (!existsSync(MODELS_CACHE_FILE)) return null;
  try {
    const cache = JSON.parse(readFileSync(MODELS_CACHE_FILE, 'utf-8'));
    const age = Date.now() - (cache._cachedAt || 0);
    if (age < MODELS_CACHE_TTL) {
      delete cache._cachedAt;
      return cache as RemoteModelsConfig;
    }
  } catch {}
  return null;
}

function saveCachedModels(models: RemoteModelsConfig) {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(MODELS_CACHE_FILE, JSON.stringify({
    ...models,
    _cachedAt: Date.now()
  }, null, 2));
}

function mergeRemoteModels(remote: RemoteModelsConfig) {
  for (const provider of PROVIDERS) {
    const remoteProvider = remote.providers[provider.value];
    if (remoteProvider && remoteProvider.models.length > 0) {
      const merged = [...remoteProvider.models];
      for (const m of provider.models) {
        if (!merged.includes(m)) merged.push(m);
      }
      provider.models = merged;
      
      if (remoteProvider.baseURL) {
        provider.baseURL = remoteProvider.baseURL;
      }
    }
  }
}

/**
 * Initialize providers: cache-first, fetch only when cache expired (>24h).
 * Called once at CLI startup.
 */
export async function initProviders() {
  const cached = loadCachedModels();
  if (cached) {
    mergeRemoteModels(cached);
    return;
  }
  
  const remote = await fetchRemoteModels();
  if (remote) {
    mergeRemoteModels(remote);
    saveCachedModels(remote);
    console.log(`🔄 Models updated (${remote.updatedAt})`);
    return;
  }
  
  // Remote fetch failed – use built-in
}

// ── Config Display & Setup ─────────────────────────────────────────

function displayCurrentConfig(config: Config | null) {
  console.log('\n📋 Current Configuration');
  console.log('========================\n');
  
  if (!config) {
    console.log('❌ No configuration found.');
    console.log('   Run: nos config  to set up your LLM providers\n');
    return false;
  }

  if (isTaskBasedConfig(config)) {
    console.log('Mode: Task-Based Configuration (v2)\n');
    
    for (const [task, taskConfig] of Object.entries(config.tasks)) {
      const info = TASK_DESCRIPTIONS[task as TaskType];
      console.log(`${info.title}`);
      console.log(`   Purpose: ${info.description}`);
      console.log(`   Examples: ${info.examples}`);
      console.log(`   Provider: ${taskConfig.provider}`);
      console.log(`   Model: ${taskConfig.model}`);
      console.log(`   API Key: ${maskApiKey(taskConfig.apiKey)}`);
      console.log('');
    }
  } else if (isMultiModelConfig(config)) {
    console.log(`Mode: Multi-Model (Legacy)\n`);
    for (const model of config.models) {
      console.log(`  [${model.purpose.toUpperCase()}] ${model.name}`);
      console.log(`    Provider: ${model.provider}`);
      console.log(`    Model: ${model.model}`);
      console.log(`    API Key: ${maskApiKey(model.apiKey)}`);
      console.log('');
    }
  } else {
    console.log('Mode: Single Model (Legacy)');
    console.log(`  Provider: ${config.provider}`);
    console.log(`  Model: ${config.model}`);
    console.log(`  API Key: ${maskApiKey(config.apiKey)}`);
  }
  
  console.log(`Config file: ${CONFIG_FILE}\n`);
  return true;
}

async function configureTask(
  task: TaskType, 
  existingConfig?: TaskModelConfig
): Promise<TaskModelConfig> {
  const { select, password, input } = await import('@inquirer/prompts');
  const info = TASK_DESCRIPTIONS[task];
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`${info.title}`);
  console.log(`${info.description}`);
  console.log(`Examples: ${info.examples}`);
  console.log(`${'='.repeat(50)}\n`);
  
  if (existingConfig) {
    console.log(`Current: ${existingConfig.provider} / ${existingConfig.model}`);
    const { confirm } = await import('@inquirer/prompts');
    const keep = await confirm({
      message: 'Keep current configuration?',
      default: true,
    });
    if (keep) return existingConfig;
  }
  
  const provider = await select({
    message: 'Select provider:',
    choices: PROVIDERS.map(p => ({ name: p.name, value: p.value })),
    default: existingConfig?.provider,
  });
  
  const providerInfo = PROVIDERS.find(p => p.value === provider)!;
  
  let availableModels = providerInfo.models;
  if (task === 'embedding') {
    availableModels = providerInfo.models.filter(m => 
      m.includes('embedding') || m.includes('embed')
    );
  } else {
    availableModels = providerInfo.models.filter(m => 
      !m.includes('embedding') && !m.includes('embed')
    );
  }
  
  if (availableModels.length === 0) {
    availableModels = providerInfo.models;
  }
  
  const model = await select({
    message: `Select model for ${task} tasks:`,
    choices: availableModels.map(m => ({ name: m, value: m })),
    default: existingConfig?.model || availableModels[0],
  });
  
  const apiKey = await password({
    message: `Enter ${providerInfo.name} API key:`,
    mask: '*',
  });
  
  return {
    provider: provider as 'openai' | 'deepseek' | 'alibaba' | 'ark',
    apiKey,
    baseURL: providerInfo.baseURL,
    model,
  };
}

export function applyConfig() {
  const config = loadConfig();
  if (!config) return;
  
  if (isTaskBasedConfig(config)) {
    const models: any[] = [];
    
    if (config.tasks.simple) {
      models.push({
        name: 'chat',
        provider: config.tasks.simple.provider,
        apiKey: config.tasks.simple.apiKey,
        baseURL: config.tasks.simple.baseURL,
        model: config.tasks.simple.model,
        purpose: 'chat'
      });
      models.push({
        name: 'fast',
        provider: config.tasks.simple.provider,
        apiKey: config.tasks.simple.apiKey,
        baseURL: config.tasks.simple.baseURL,
        model: config.tasks.simple.model,
        purpose: 'fast'
      });
    }
    
    if (config.tasks.reasoning) {
      models.push({
        name: 'reasoning',
        provider: config.tasks.reasoning.provider,
        apiKey: config.tasks.reasoning.apiKey,
        baseURL: config.tasks.reasoning.baseURL,
        model: config.tasks.reasoning.model,
        purpose: 'reasoning'
      });
    }
    
    if (config.tasks.embedding) {
      models.push({
        name: 'embedding',
        provider: config.tasks.embedding.provider,
        apiKey: config.tasks.embedding.apiKey,
        baseURL: config.tasks.embedding.baseURL,
        model: config.tasks.embedding.model,
        purpose: 'embedding'
      });
    }
    
    process.env.LLM_MODELS_CONFIG = JSON.stringify({ models, defaultModel: 'chat' });
    
    if (config.tasks.reasoning) {
      process.env.LLM_PROVIDER = config.tasks.reasoning.provider;
      process.env.LLM_MODEL = config.tasks.reasoning.model;
      if (config.tasks.reasoning.provider === 'openai') {
        process.env.OPENAI_API_KEY = config.tasks.reasoning.apiKey;
      } else if (config.tasks.reasoning.provider === 'deepseek') {
        process.env.DEEPSEEK_API_KEY = config.tasks.reasoning.apiKey;
      }
    }
  } else if (isMultiModelConfig(config)) {
    process.env.LLM_MODELS_CONFIG = JSON.stringify({
      models: config.models,
      defaultModel: config.defaultModel
    });
  } else {
    process.env.LLM_PROVIDER = config.provider;
    process.env.LLM_MODEL = config.model;
    if (config.provider === 'openai') {
      process.env.OPENAI_API_KEY = config.apiKey;
    } else if (config.provider === 'deepseek') {
      process.env.DEEPSEEK_API_KEY = config.apiKey;
    }
  }
}

export async function configCommand(showOnly = false) {
  const existing = loadConfig();
  const hasConfig = displayCurrentConfig(existing);
  
  if (showOnly) return;
  
  const { confirm } = await import('@inquirer/prompts');
  
  if (hasConfig) {
    const reconfigure = await confirm({
      message: 'Do you want to reconfigure?',
      default: false,
    });
    if (!reconfigure) {
      console.log('\n✅ Keeping existing configuration.');
      return;
    }
  }
  
  console.log('\n🚀 Setting up task-based model configuration\n');
  console.log('You will configure models for three task types.');
  console.log('Each task type can use a different provider and model.\n');
  
  const existingTasks = existing && isTaskBasedConfig(existing) ? existing.tasks : undefined;
  
  const tasks: Record<TaskType, TaskModelConfig> = {
    simple: await configureTask('simple', existingTasks?.simple),
    reasoning: await configureTask('reasoning', existingTasks?.reasoning),
    embedding: await configureTask('embedding', existingTasks?.embedding),
  };
  
  saveConfig({ version: 2, tasks });
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Configuration saved successfully!');
  console.log('='.repeat(50) + '\n');
  
  for (const [task, taskConfig] of Object.entries(tasks)) {
    const info = TASK_DESCRIPTIONS[task as TaskType];
    console.log(`${info.title}: ${taskConfig.provider} / ${taskConfig.model}`);
  }
  console.log('');
}
