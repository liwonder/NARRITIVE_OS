import { getLLM } from '../llm/client.js';
import type { Chapter, StoryBible } from '../types/index.js';
import type { NarrativeMemory } from '../memory/vectorStore.js';

interface ExtractedMemory {
  content: string;
  category: NarrativeMemory['category'];
}

interface ExtractionOutput {
  memories: ExtractedMemory[];
}

const EXTRACTION_PROMPT = `You are a narrative memory extractor. Your job is to analyze a chapter and extract important facts that should be remembered for future chapters.

## Story Bible

**Title:** {{title}}
**Genre:** {{genre}}
**Setting:** {{setting}}

## Chapter to Analyze

**Chapter {{chapterNumber}}: {{chapterTitle}}**

{{chapterContent}}

## Extraction Task

Extract 5-10 important narrative memories from this chapter. Focus on:

1. **Events** - Significant things that happened (plot points, discoveries, battles, meetings)
2. **Character** - Character development, new traits revealed, relationships changed
3. **World** - New world details revealed (locations, cultures, magic systems, technology)
4. **Plot** - Plot thread developments, mysteries introduced, foreshadowing

For each memory:
- Write a clear, standalone sentence that captures the fact
- Categorize it appropriately
- Be specific enough that it would be useful for maintaining continuity

Respond with JSON only:
{
  "memories": [
    {"content": "Alice discovered the ancient map hidden in her grandmother's attic", "category": "event"},
    {"content": "Bob is secretly afraid of water due to a childhood drowning incident", "category": "character"},
    {"content": "The city of Eldoria has a strict curfew enforced by mechanical guards", "category": "world"},
    {"content": "The prophecy mentions three keys that must be found before the eclipse", "category": "plot"}
  ]
}`;

export class MemoryExtractor {
  async extract(chapter: Chapter, bible: StoryBible): Promise<ExtractedMemory[]> {
    const prompt = EXTRACTION_PROMPT
      .replace('{{title}}', bible.title)
      .replace('{{genre}}', bible.genre)
      .replace('{{setting}}', bible.setting)
      .replace('{{chapterNumber}}', chapter.number.toString())
      .replace('{{chapterTitle}}', chapter.title)
      .replace('{{chapterContent}}', chapter.content.substring(0, 8000)); // Limit content length

    const result = await getLLM().completeJSON<ExtractionOutput>(prompt, {
      temperature: 0.3,
      maxTokens: 2000,
    });

    return result.memories || [];
  }

  async extractFromSummary(chapterNumber: number, summary: string, bible: StoryBible): Promise<ExtractedMemory[]> {
    const prompt = `You are a narrative memory extractor. Extract important facts from this chapter summary.

## Story
**Title:** ${bible.title}
**Genre:** ${bible.genre}

## Chapter ${chapterNumber} Summary
${summary}

Extract 3-5 key memories (events, character moments, world details, plot developments). Respond with JSON:
{
  "memories": [
    {"content": "description of what happened", "category": "event|character|world|plot"}
  ]
}`;

    const result = await getLLM().completeJSON<ExtractionOutput>(prompt, {
      temperature: 0.3,
      maxTokens: 1000,
    });

    return result.memories || [];
  }
}

export const memoryExtractor = new MemoryExtractor();
