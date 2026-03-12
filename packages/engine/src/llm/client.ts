import OpenAI from 'openai';
import type { LLMConfig, LLMProviderConfig, ModelConfig, TaskType } from '../types/index.js';

export interface LLMProvider {
  complete(prompt: string, config?: Partial<LLMConfig>): Promise<string>;
}

class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(config: LLMProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async complete(prompt: string, config?: Partial<LLMConfig>): Promise<string> {
    const model = config?.model || 'gpt-4o-mini';
    console.log(`[LLM] Using model: ${model}`);
    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? 4000,
    });
    
    // Handle DeepSeek reasoning models which may have reasoning_content
    const message = response.choices[0]?.message;
    if (!message) return '';
    
    // For DeepSeek reasoning models, use content field (reasoning_content contains the thinking process)
    // We want the actual response, not the reasoning chain
    const content = message.content || '';
    return content;
  }
}

// Task-to-model mapping configuration
const TASK_MODEL_MAPPING: Record<TaskType, string> = {
  generation: 'reasoning',   // Use reasoning model for complex creative tasks
  planning: 'reasoning',     // Use reasoning model for planning
  validation: 'chat',        // Use chat model for validation
  summarization: 'fast',     // Use fast model for summarization
  extraction: 'chat',        // Use chat model for extraction
  default: 'chat',           // Default to chat model
};

export class LLMClient {
  private providers: Map<string, LLMProvider> = new Map();
  private models: Map<string, ModelConfig> = new Map();
  private defaultModelName: string;

  constructor() {
    this.loadMultiModelConfig();
  }

  private loadMultiModelConfig() {
    // Check for multi-model configuration in environment
    const configJson = process.env.LLM_MODELS_CONFIG;
    
    if (configJson) {
      // Multi-model config provided as JSON
      try {
        const config = JSON.parse(configJson);
        for (const model of config.models) {
          this.models.set(model.name, model);
          this.providers.set(model.name, new OpenAIProvider(model));
        }
        this.defaultModelName = config.defaultModel;
      } catch (e) {
        console.warn('Failed to parse LLM_MODELS_CONFIG, falling back to single model config');
        this.loadSingleModelConfig();
      }
    } else {
      this.loadSingleModelConfig();
    }
  }

  private loadSingleModelConfig() {
    // Backward compatibility: load single model config
    const provider = process.env.LLM_PROVIDER || 'openai';
    const modelConfig: ModelConfig = {
      name: 'default',
      provider,
      apiKey: provider === 'openai' 
        ? (process.env.OPENAI_API_KEY || '') 
        : (process.env.DEEPSEEK_API_KEY || ''),
      baseURL: provider === 'deepseek' ? 'https://api.deepseek.com' : undefined,
      model: process.env.LLM_MODEL || (provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini'),
      purpose: 'chat',
    };
    
    this.models.set('default', modelConfig);
    this.providers.set('default', new OpenAIProvider(modelConfig));
    this.defaultModelName = 'default';
    
    // Also add reasoning model if DEEPSEEK_REASONER_API_KEY is set
    if (process.env.DEEPSEEK_API_KEY) {
      const reasoningConfig: ModelConfig = {
        name: 'reasoning',
        provider: 'deepseek',
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
        model: 'deepseek-reasoner',
        purpose: 'reasoning',
      };
      this.models.set('reasoning', reasoningConfig);
      this.providers.set('reasoning', new OpenAIProvider(reasoningConfig));
    }
  }

  private getModelForTask(task: TaskType): ModelConfig {
    const purpose = TASK_MODEL_MAPPING[task] || 'chat';
    
    // Find a model with the matching purpose
    for (const [name, config] of this.models) {
      if (config.purpose === purpose) {
        return config;
      }
    }
    
    // Fall back to default
    return this.models.get(this.defaultModelName)!;
  }

  private getProvider(modelName: string): LLMProvider {
    const provider = this.providers.get(modelName);
    if (!provider) {
      throw new Error(`Model not found: ${modelName}`);
    }
    return provider;
  }

  async complete(prompt: string, config?: Partial<LLMConfig> & { task?: TaskType }): Promise<string> {
    const task = config?.task || 'default';
    const modelConfig = this.getModelForTask(task);
    const provider = this.getProvider(modelConfig.name);
    
    const finalConfig: LLMConfig = {
      model: modelConfig.model,
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 4000,
    };
    
    return provider.complete(prompt, finalConfig);
  }

  async completeJSON<T>(prompt: string, config?: Partial<LLMConfig> & { task?: TaskType }): Promise<T> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: You must respond with valid JSON only. No markdown, no explanations, no thinking process. Start your response with { and end with }.`;
    const response = await this.complete(jsonPrompt, {
      ...config,
      temperature: config?.temperature ?? 0.3,
    });
    
    // Try to extract JSON from the response
    let jsonText = response.trim();
    
    // First, try to find JSON in markdown code blocks
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    } else {
      // Try to find JSON object/array by looking for first { or [ and matching braces
      const objectMatch = jsonText.match(/\{[\s\S]*\}/);
      const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
      
      if (objectMatch) {
        jsonText = objectMatch[0];
      } else if (arrayMatch) {
        jsonText = arrayMatch[0];
      }
    }
    
    try {
      return JSON.parse(jsonText) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${jsonText.substring(0, 200)}`);
    }
  }

  // Get available models info
  getAvailableModels(): { name: string; purpose: string; model: string }[] {
    return Array.from(this.models.entries()).map(([name, config]) => ({
      name,
      purpose: config.purpose,
      model: config.model,
    }));
  }
}

let _llm: LLMClient | null = null;

export function getLLM(): LLMClient {
  if (!_llm) {
    _llm = new LLMClient();
  }
  return _llm;
}
