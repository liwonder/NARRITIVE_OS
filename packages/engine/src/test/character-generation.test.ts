import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCharacters } from '../story/bible.js';
import { getLLM } from '../llm/client.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Mock the LLM client
vi.mock('../llm/client.js', () => ({
  getLLM: vi.fn()
}));

// Helper to save debug output
function saveDebugOutput(testName: string, rawResponse: string, error?: Error) {
  const debugDir = join(process.cwd(), 'test-debug');
  if (!existsSync(debugDir)) {
    mkdirSync(debugDir, { recursive: true });
  }
  
  const timestamp = Date.now();
  const filename = `character-gen-${testName.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.json`;
  
  writeFileSync(
    join(debugDir, filename),
    JSON.stringify({
      testName,
      timestamp: new Date().toISOString(),
      rawResponse,
      rawResponseLength: rawResponse.length,
      rawResponseChars: rawResponse.split('').map((c, i) => ({ index: i, char: c, code: c.charCodeAt(0) })).slice(-50),
      error: error ? { message: error.message, stack: error.stack } : null
    }, null, 2)
  );
}

describe('generateCharacters', () => {
  const mockComplete = vi.fn();

  beforeEach(() => {
    vi.mocked(getLLM).mockReturnValue({
      complete: mockComplete,
      completeJSON: vi.fn()
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle complete JSON response', async () => {
    const validResponse = JSON.stringify([{
      name: '李明',
      role: 'protagonist',
      personality: ['勇敢', '聪明'],
      goals: ['找到真相', '保护家人']
    }]);

    mockComplete.mockResolvedValue(validResponse);

    const characters = await generateCharacters(
      '测试小说',
      '一个关于冒险的故事',
      'wuxia',
      '古代中国',
      'zh'
    );

    expect(characters).toHaveLength(1);
    expect(characters[0].name).toBe('李明');
    expect(characters[0].role).toBe('protagonist');
    expect(characters[0].id).toBeDefined();
  });

  it('should handle incomplete JSON with unterminated string', async () => {
    // Simulate truncated JSON response - string is cut off mid-value
    const incompleteResponse = `[{\n  "name": "李明",\n  "role": "protagonist",\n  "personality": ["勇敢", "聪明"],\n  "goals": ["找到真相`;

    mockComplete.mockResolvedValue(incompleteResponse);

    // This case is hard to recover from - should throw error
    // The test expects this to fail because we can't fix mid-string truncation
    await expect(generateCharacters(
      '测试小说',
      '一个关于冒险的故事',
      'wuxia',
      '古代中国',
      'zh'
    )).rejects.toThrow();
  });

  it('should handle JSON with markdown code blocks', async () => {
    const markdownResponse = '```json\n' + JSON.stringify([{
      name: 'Alice',
      role: 'protagonist',
      personality: ['brave', 'curious'],
      goals: ['find the treasure']
    }]) + '\n```';

    mockComplete.mockResolvedValue(markdownResponse);

    const characters = await generateCharacters(
      'Test Novel',
      'An adventure story',
      'fantasy',
      'Medieval Europe',
      'en'
    );

    expect(characters).toHaveLength(1);
    expect(characters[0].name).toBe('Alice');
  });

  it('should handle JSON missing closing bracket', async () => {
    const missingBracket = `[{\n  "name": "Test",\n  "role": "protagonist",\n  "personality": ["brave"],\n  "goals": ["test goal"]\n}`;

    mockComplete.mockResolvedValue(missingBracket);

    const characters = await generateCharacters(
      'Test',
      'Test premise',
      'scifi',
      'Future',
      'en'
    );

    expect(characters).toHaveLength(1);
    expect(characters[0].name).toBe('Test');
  });

  it('should handle deeply nested incomplete JSON', async () => {
    // String truncated mid-value in goals array
    const nestedIncomplete = `[{\n  "name": "李明",\n  "role": "protagonist",\n  "personality": ["勇敢", "聪明", "善良"],\n  "goals": ["找到真相", "保护家人", "成为武林盟主`;

    mockComplete.mockResolvedValue(nestedIncomplete);

    // This should throw because string is truncated mid-value
    await expect(generateCharacters(
      '武侠测试',
      '一个武侠故事',
      'wuxia',
      '古代江湖',
      'zh'
    )).rejects.toThrow();
  });

  it('should handle escaped quotes in strings', async () => {
    const escapedQuotes = JSON.stringify([{
      name: 'Li "The Brave" Ming',
      role: 'protagonist',
      personality: ['brave', 'strong'],
      goals: ['become a hero']
    }]);

    mockComplete.mockResolvedValue(escapedQuotes);

    const characters = await generateCharacters(
      'Test',
      'Test',
      'fantasy',
      'Medieval',
      'en'
    );

    expect(characters).toHaveLength(1);
    expect(characters[0].name).toBe('Li "The Brave" Ming');
  });

  it('should handle truncated response in the middle of an array', async () => {
    const truncatedArray = `[{\n  "name": "Test",\n  "role": "protagonist",\n  "personality": ["brave", "`;

    mockComplete.mockResolvedValue(truncatedArray);

    // This should throw an error as we can't recover from mid-string truncation
    await expect(generateCharacters(
      'Test',
      'Test',
      'fantasy',
      'Medieval',
      'en'
    )).rejects.toThrow();
  });

  it('should handle JSON with extra whitespace', async () => {
    const whitespaceResponse = `  \n\n  [\n    {\n      "name": "Test",\n      "role": "protagonist",\n      "personality": ["brave"],\n      "goals": ["test"]\n    }\n  ]  \n\n  `;

    mockComplete.mockResolvedValue(whitespaceResponse);

    const characters = await generateCharacters(
      'Test',
      'Test',
      'fantasy',
      'Medieval',
      'en'
    );

    expect(characters).toHaveLength(1);
    expect(characters[0].name).toBe('Test');
  });

  it('should handle object with all fields complete', async () => {
    // With no maxTokens limit, LLM should return complete JSON
    const completeResponse = `[{\n  "name": "Test",\n  "role": "protagonist",\n  "personality": ["brave", "smart"],\n  "goals": ["save the world"]\n}]`;

    mockComplete.mockResolvedValue(completeResponse);

    const characters = await generateCharacters(
      'Test',
      'Test',
      'fantasy',
      'Medieval',
      'en'
    );

    expect(characters).toHaveLength(1);
    expect(characters[0].name).toBe('Test');
    expect(characters[0].personality).toEqual(['brave', 'smart']);
    expect(characters[0].goals).toEqual(['save the world']);
  });
});
