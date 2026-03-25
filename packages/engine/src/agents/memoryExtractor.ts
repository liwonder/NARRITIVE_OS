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
  // Segment size for long chapters (characters)
  private readonly SEGMENT_SIZE = 6000;
  // Overlap between segments to ensure continuity
  private readonly SEGMENT_OVERLAP = 500;

  async extract(chapter: Chapter, bible: StoryBible): Promise<ExtractedMemory[]> {
    const content = chapter.content;
    
    // If content is short enough, extract directly
    if (content.length <= this.SEGMENT_SIZE) {
      return this.extractFromSegment(content, chapter, bible);
    }

    // For long content, segment and extract from each part
    console.log(`  Chapter ${chapter.number} content is long (${content.length} chars), segmenting for extraction...`);
    const segments = this.segmentContent(content);
    const allMemories: ExtractedMemory[] = [];

    for (let i = 0; i < segments.length; i++) {
      console.log(`  Extracting from segment ${i + 1}/${segments.length}...`);
      const segmentMemories = await this.extractFromSegment(segments[i], chapter, bible, i + 1, segments.length);
      allMemories.push(...segmentMemories);
    }

    // Deduplicate memories by content similarity
    const deduplicated = this.deduplicateMemories(allMemories);
    console.log(`  Extracted ${deduplicated.length} unique memories from ${segments.length} segments`);
    
    return deduplicated;
  }

  private segmentContent(content: string): string[] {
    const segments: string[] = [];
    let start = 0;

    while (start < content.length) {
      const end = Math.min(start + this.SEGMENT_SIZE, content.length);
      // Try to break at a paragraph boundary
      let breakPoint = end;
      if (end < content.length) {
        // Look for paragraph break within 200 chars of the target end
        const searchRange = content.substring(Math.max(start + this.SEGMENT_SIZE - 200, start), end + 200);
        const paragraphBreak = searchRange.lastIndexOf('\n\n');
        if (paragraphBreak > 0) {
          breakPoint = Math.max(start + this.SEGMENT_SIZE - 200, start) + paragraphBreak + 2;
        }
      }

      segments.push(content.substring(start, breakPoint));
      start = breakPoint - this.SEGMENT_OVERLAP; // Overlap for continuity
    }

    return segments;
  }

  private async extractFromSegment(
    segmentContent: string, 
    chapter: Chapter, 
    bible: StoryBible,
    segmentIndex?: number,
    totalSegments?: number
  ): Promise<ExtractedMemory[]> {
    let prompt = EXTRACTION_PROMPT
      .replace('{{title}}', bible.title)
      .replace('{{genre}}', bible.genre)
      .replace('{{setting}}', bible.setting)
      .replace('{{chapterNumber}}', chapter.number.toString())
      .replace('{{chapterTitle}}', chapter.title)
      .replace('{{chapterContent}}', segmentContent);

    // Add segment context for long chapters
    if (segmentIndex && totalSegments && totalSegments > 1) {
      prompt = prompt.replace(
        '## Chapter to Analyze',
        `## Chapter to Analyze (Part ${segmentIndex} of ${totalSegments})`
      );
    }

    const result = await getLLM().completeJSON<ExtractionOutput>(prompt, {
      temperature: 0.3,
      maxTokens: 2000,
      task: 'extraction',
    });

    return result.memories || [];
  }

  private deduplicateMemories(memories: ExtractedMemory[]): ExtractedMemory[] {
    const seen = new Set<string>();
    const deduplicated: ExtractedMemory[] = [];

    for (const memory of memories) {
      // Normalize content for comparison
      const normalized = memory.content.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Simple deduplication: check if we've seen something very similar
      let isDuplicate = false;
      for (const existing of seen) {
        if (this.similarity(normalized, existing) > 0.8) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        seen.add(normalized);
        deduplicated.push(memory);
      }
    }

    return deduplicated;
  }

  private similarity(a: string, b: string): number {
    // Simple Jaccard similarity for short strings
    const setA = new Set(a.split(' '));
    const setB = new Set(b.split(' '));
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
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
      task: 'extraction',
    });

    return result.memories || [];
  }
}

export const memoryExtractor = new MemoryExtractor();
