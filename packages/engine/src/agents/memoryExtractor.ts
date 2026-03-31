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
  // Segment size for long chapters (characters) - reduced to save memory
  private readonly SEGMENT_SIZE = 4000;
  // Overlap between segments - reduced to save memory
  private readonly SEGMENT_OVERLAP = 200;

  async extract(chapter: Chapter, bible: StoryBible): Promise<ExtractedMemory[]> {
    const content = chapter.content;
    
    // If content is short enough, extract directly
    if (content.length <= this.SEGMENT_SIZE) {
      return this.extractFromSegment(content, chapter, bible);
    }

    // For long content, process segments one by one (streaming) to save memory
    console.log(`  Chapter ${chapter.number} content is long (${content.length} chars), segmenting for extraction...`);
    const allMemories: ExtractedMemory[] = [];
    const totalSegments = this.calculateSegmentCount(content);

    let start = 0;
    let segmentIndex = 0;
    while (start < content.length) {
      segmentIndex++;
      const segment = this.getNextSegment(content, start);
      console.log(`  Extracting from segment ${segmentIndex}/${totalSegments}...`);
      
      const segmentMemories = await this.extractFromSegment(segment, chapter, bible, segmentIndex, totalSegments);
      allMemories.push(...segmentMemories);
      
      // Move start position, accounting for overlap
      // Ensure we make at least (SEGMENT_SIZE - OVERLAP) progress to avoid infinite loop
      const minAdvance = this.SEGMENT_SIZE - this.SEGMENT_OVERLAP;
      start = start + Math.max(segment.length - this.SEGMENT_OVERLAP, minAdvance);
      
      // Hint to GC that segment can be freed
      if (segmentIndex % 2 === 0) {
        global.gc && global.gc();
      }
    }

    // Deduplicate memories by content similarity
    const deduplicated = this.deduplicateMemories(allMemories);
    console.log(`  Extracted ${deduplicated.length} unique memories from ${totalSegments} segments`);
    
    return deduplicated;
  }

  private calculateSegmentCount(content: string): number {
    // Approximate segment count
    const effectiveSize = this.SEGMENT_SIZE - this.SEGMENT_OVERLAP;
    return Math.ceil(content.length / effectiveSize);
  }

  private getNextSegment(content: string, start: number): string {
    const end = Math.min(start + this.SEGMENT_SIZE, content.length);
    
    // Try to break at a paragraph boundary
    let breakPoint = end;
    if (end < content.length) {
      // Look for paragraph break within 200 chars of the target end
      const searchStart = Math.max(end - 200, start);
      const searchRange = content.substring(searchStart, end + 200);
      
      // Try different paragraph separators (\n\n for Western, \n for Chinese, etc.)
      let paragraphBreak = searchRange.lastIndexOf('\n\n');
      if (paragraphBreak < 0) {
        paragraphBreak = searchRange.lastIndexOf('\n');
      }
      if (paragraphBreak < 0) {
        paragraphBreak = searchRange.lastIndexOf('。');
      }
      
      if (paragraphBreak > 0) {
        const candidateBreak = searchStart + paragraphBreak + 1;
        // Ensure we make reasonable progress (at least 50% of SEGMENT_SIZE)
        const minProgress = Math.floor(this.SEGMENT_SIZE * 0.5);
        if (candidateBreak - start >= minProgress) {
          breakPoint = candidateBreak;
        }
      }
    }

    return content.substring(start, breakPoint);
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
