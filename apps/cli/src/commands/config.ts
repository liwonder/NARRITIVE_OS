import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.narrative-os');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

// Task-based model configuration
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

// Legacy configs for backward compatibility
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

const PROVIDERS = [
  { 
    name: 'OpenAI', 
    value: 'openai', 
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'text-embedding-3-small'],
    baseURL: undefined
  },
  { 
    name: 'DeepSeek', 
    value: 'deepseek', 
    models: ['deepseek-chat', 'deepseek-reasoner'],
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
  
  // Show current if exists
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
  
  // Filter models based on task type
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
  
  // If no suitable models, show all
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

/**
 * Apply configuration to the engine by setting environment variables
 * This is called at CLI startup to make config available to the engine
 */
export function applyConfig() {
  const config = loadConfig();
  if (!config) return;
  
  if (isTaskBasedConfig(config)) {
    // New v2 format: set LLM_MODELS_CONFIG with task-based config
    // Convert to engine-compatible format
    const models: any[] = [];
    
    // Simple task -> chat model
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
    
    // Reasoning task -> reasoning model
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
    
    // Embedding task -> embedding model
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
    
    const engineConfig = {
      models,
      defaultModel: 'chat'
    };
    
    process.env.LLM_MODELS_CONFIG = JSON.stringify(engineConfig);
    
    // Also set legacy env vars for backward compatibility
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
    // Legacy multi-model format
    process.env.LLM_MODELS_CONFIG = JSON.stringify({
      models: config.models,
      defaultModel: config.defaultModel
    });
  } else {
    // Legacy single-model format
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
  
  // Always show current config first
  const hasConfig = displayCurrentConfig(existing);
  
  if (showOnly) {
    return;
  }
  
  const { confirm } = await import('@inquirer/prompts');
  
  // Ask if user wants to reconfigure
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
  
  // Get existing task configs if available
  const existingTasks = existing && isTaskBasedConfig(existing) ? existing.tasks : undefined;
  
  // Configure each task
  const tasks: Record<TaskType, TaskModelConfig> = {
    simple: await configureTask('simple', existingTasks?.simple),
    reasoning: await configureTask('reasoning', existingTasks?.reasoning),
    embedding: await configureTask('embedding', existingTasks?.embedding),
  };
  
  const config: TaskBasedConfig = {
    version: 2,
    tasks,
  };
  
  saveConfig(config);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Configuration saved successfully!');
  console.log('='.repeat(50) + '\n');
  
  // Display summary
  for (const [task, taskConfig] of Object.entries(tasks)) {
    const info = TASK_DESCRIPTIONS[task as TaskType];
    console.log(`${info.title}: ${taskConfig.provider} / ${taskConfig.model}`);
  }
  console.log('');
}
