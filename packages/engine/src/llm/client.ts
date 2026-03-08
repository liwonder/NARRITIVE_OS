import OpenAI from 'openai';
import type { LLMConfig, LLMProviderConfig } from '../types/index.js';

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
    return response.choices[0]?.message?.content || '';
  }
}

export class LLMClient {
  private provider: LLMProvider;
  private defaultConfig: LLMConfig;

  constructor(providerConfig?: LLMProviderConfig) {
    const config = providerConfig || this.loadConfig();
    this.provider = this.createProvider(config);
    
    this.defaultConfig = {
      model: config.model || 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 4000,
    };
  }

  private loadConfig(): LLMProviderConfig {
    const provider = process.env.LLM_PROVIDER || 'openai';
    
    switch (provider) {
      case 'openai':
        return {
          provider: 'openai',
          apiKey: process.env.OPENAI_API_KEY || '',
          model: process.env.LLM_MODEL || 'gpt-4o-mini',
        };
      case 'deepseek':
        return {
          provider: 'deepseek',
          apiKey: process.env.DEEPSEEK_API_KEY || '',
          baseURL: 'https://api.deepseek.com',
          model: process.env.LLM_MODEL || 'deepseek-chat',
        };
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private createProvider(config: LLMProviderConfig): LLMProvider {
    switch (config.provider) {
      case 'openai':
      case 'deepseek':
        return new OpenAIProvider(config);
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  async complete(prompt: string, config?: Partial<LLMConfig>): Promise<string> {
    const finalConfig = { ...this.defaultConfig, ...config };
    return this.provider.complete(prompt, finalConfig);
  }

  async completeJSON<T>(prompt: string, config?: Partial<LLMConfig>): Promise<T> {
    const jsonPrompt = `${prompt}\n\nYou must respond with valid JSON only. No markdown, no explanations.`;
    const response = await this.complete(jsonPrompt, {
      ...config,
      temperature: config?.temperature ?? 0.3,
    });
    
    try {
      return JSON.parse(response) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${response.substring(0, 200)}`);
    }
  }
}

let _llm: LLMClient | null = null;

export function getLLM(): LLMClient {
  if (!_llm) {
    _llm = new LLMClient();
  }
  return _llm;
}
