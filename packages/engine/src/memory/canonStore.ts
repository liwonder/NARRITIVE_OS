import type { StoryBible, Chapter } from '../types/index.js';
import { getLLM } from '../llm/client.js';

export interface CanonFact {
  id: string;
  category: 'character' | 'world' | 'plot' | 'timeline';
  subject: string;
  attribute: string;
  value: string;
  chapterEstablished: number;
}

export interface CanonStore {
  storyId: string;
  facts: CanonFact[];
}

export function createCanonStore(storyId: string): CanonStore {
  return {
    storyId,
    facts: [],
  };
}

export function extractCanonFromBible(bible: StoryBible): CanonStore {
  const store = createCanonStore(bible.id);

  for (const char of bible.characters) {
    addFact(store, {
      category: 'character',
      subject: char.name,
      attribute: 'role',
      value: char.role,
      chapterEstablished: 0,
    });

    if (char.background) {
      addFact(store, {
        category: 'character',
        subject: char.name,
        attribute: 'background',
        value: char.background,
        chapterEstablished: 0,
      });
    }
  }

  for (const thread of bible.plotThreads) {
    addFact(store, {
      category: 'plot',
      subject: thread.name,
      attribute: 'status',
      value: thread.status,
      chapterEstablished: 0,
    });
  }

  return store;
}

export function addFact(store: CanonStore, fact: Omit<CanonFact, 'id'>): CanonStore {
  const newFact: CanonFact = {
    ...fact,
    id: generateId(),
  };
  return {
    ...store,
    facts: [...store.facts, newFact],
  };
}

export function getFactsByCategory(store: CanonStore, category: CanonFact['category']): CanonFact[] {
  return store.facts.filter(f => f.category === category);
}

export function getFact(store: CanonStore, subject: string, attribute: string): CanonFact | undefined {
  return store.facts.find(f => f.subject === subject && f.attribute === attribute);
}

export function updateFact(store: CanonStore, subject: string, attribute: string, value: string, chapter: number): CanonStore {
  const existingIndex = store.facts.findIndex(f => f.subject === subject && f.attribute === attribute);
  
  if (existingIndex >= 0) {
    const updatedFacts = [...store.facts];
    updatedFacts[existingIndex] = {
      ...updatedFacts[existingIndex],
      value,
      chapterEstablished: chapter,
    };
    return { ...store, facts: updatedFacts };
  }
  
  return addFact(store, {
    category: 'plot',
    subject,
    attribute,
    value,
    chapterEstablished: chapter,
  });
}

export function formatCanonForPrompt(store: CanonStore): string {
  const lines: string[] = ['## Story Canon (NEVER contradict these facts)'];
  
  const characters = getFactsByCategory(store, 'character');
  if (characters.length > 0) {
    lines.push('\n### Characters');
    for (const fact of characters) {
      lines.push(`- ${fact.subject}: ${fact.attribute} = ${fact.value}`);
    }
  }
  
  const world = getFactsByCategory(store, 'world');
  if (world.length > 0) {
    lines.push('\n### World');
    for (const fact of world) {
      lines.push(`- ${fact.subject}: ${fact.attribute} = ${fact.value}`);
    }
  }
  
  const plot = getFactsByCategory(store, 'plot');
  if (plot.length > 0) {
    lines.push('\n### Plot');
    for (const fact of plot) {
      lines.push(`- ${fact.subject}: ${fact.attribute} = ${fact.value}`);
    }
  }
  
  return lines.join('\n');
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Segment size for long chapters (characters)
const CANON_SEGMENT_SIZE = 5000;
// Overlap between segments
const CANON_SEGMENT_OVERLAP = 400;

/**
 * Extract new canon facts from chapter content
 * Canon stores IMMUTABLE facts only - events that happened, revelations made, background established
 * NOT current states (location, emotion, inventory) - those belong to World State
 */
export async function extractCanonFromChapter(
  store: CanonStore,
  chapter: Chapter,
  bible: StoryBible
): Promise<CanonStore> {
  const content = chapter.content;
  
  // If content is short enough, extract directly
  if (content.length <= CANON_SEGMENT_SIZE) {
    return extractCanonFromSegment(store, chapter, bible, content);
  }

  // For long content, segment and extract from each part
  console.log(`  Canon extraction: Chapter ${chapter.number} is long (${content.length} chars), segmenting...`);
  const segments = segmentContentForCanon(content);
  let updatedStore = store;

  for (let i = 0; i < segments.length; i++) {
    console.log(`  Extracting canon from segment ${i + 1}/${segments.length}...`);
    updatedStore = await extractCanonFromSegment(updatedStore, chapter, bible, segments[i], i + 1, segments.length);
  }

  console.log(`  Canon extraction complete: ${updatedStore.facts.length - store.facts.length} new facts`);
  return updatedStore;
}

function segmentContentForCanon(content: string): string[] {
  const segments: string[] = [];
  let start = 0;

  while (start < content.length) {
    const end = Math.min(start + CANON_SEGMENT_SIZE, content.length);
    // Try to break at a paragraph boundary
    let breakPoint = end;
    if (end < content.length) {
      const searchRange = content.substring(Math.max(start + CANON_SEGMENT_SIZE - 200, start), end + 200);
      const paragraphBreak = searchRange.lastIndexOf('\n\n');
      if (paragraphBreak > 0) {
        breakPoint = Math.max(start + CANON_SEGMENT_SIZE - 200, start) + paragraphBreak + 2;
      }
    }

    segments.push(content.substring(start, breakPoint));
    start = breakPoint - CANON_SEGMENT_OVERLAP;
  }

  return segments;
}

async function extractCanonFromSegment(
  store: CanonStore,
  chapter: Chapter,
  bible: StoryBible,
  segmentContent: string,
  segmentIndex?: number,
  totalSegments?: number
): Promise<CanonStore> {
  const segmentInfo = segmentIndex && totalSegments && totalSegments > 1 
    ? ` (Part ${segmentIndex} of ${totalSegments})` 
    : '';

  const prompt = `You are a canon extractor. Extract IMMUTABLE facts from this chapter that should be permanently recorded in the story's canon.

## Story Bible
Title: ${bible.title}
Genre: ${bible.genre}
Setting: ${bible.setting}

## Existing Canon Facts (DO NOT duplicate these)
${store.facts.map(f => `- ${f.subject} ${f.attribute}: ${f.value}`).join('\n') || 'None yet'}

## Chapter ${chapter.number}: ${chapter.title}${segmentInfo}
${segmentContent}

## IMPORTANT: Canon vs World State Boundary

**Canon (IMMUTABLE - Extract these):**
- Events that OCCURRED: "主角在第${chapter.number}章于古城受伤"
- Revelations/Discoveries: "神秘人的真实身份是主角的哥哥"
- Backstory established: "主角童年在孤儿院长大"
- World rules revealed: "古城的魔法阵需要血祭激活"
- Relationships established: "A和B是兄妹关系"
- Permanent changes: "古城被摧毁"

**World State (DYNAMIC - DO NOT extract):**
- Current location: "主角目前在客栈" ❌
- Current emotion: "主角现在很愤怒" ❌
- Current inventory: "主角持有宝剑" ❌
- Temporary status: "主角正在战斗中" ❌

## Extraction Task

Identify NEW immutable facts established in this chapter. For each fact:
- category: 'character' | 'world' | 'plot' | 'timeline'
- subject: who or what the fact is about
- attribute: what aspect (e.g., 'event_chapter${chapter.number}', 'backstory', 'identity', 'relationship', 'world_rule')
- value: the permanent fact (include chapter number for events)

Only include facts that:
- Are PERMANENT (won't change in future chapters)
- Are EXPLICITLY stated or clearly implied
- Would violate continuity if contradicted later
- Are NOT already in existing canon

Respond with JSON only:
{
  "facts": [
    {"category": "character", "subject": "主角", "attribute": "event_chapter${chapter.number}", "value": "在古城与黑衣人战斗，左臂受伤"},
    {"category": "character", "subject": "神秘人", "attribute": "identity", "value": "主角的亲生哥哥"},
    {"category": "world", "subject": "古城", "attribute": "world_rule", "value": "魔法阵需要血祭才能激活"},
    {"category": "plot", "subject": "主线剧情", "attribute": "revelation_chapter${chapter.number}", "value": "宝藏其实是封印恶魔的容器"}
  ]
}`;

  try {
    const result = await getLLM().completeJSON<{ facts: Array<Omit<CanonFact, 'id' | 'chapterEstablished'>> }>(prompt, {
      temperature: 0.3,
      maxTokens: 1500,
      task: 'extraction',
    });

    if (!result.facts || result.facts.length === 0) {
      return store;
    }

    // Add new facts to store
    let updatedStore = store;
    for (const fact of result.facts) {
      // Check if fact already exists (same subject + attribute)
      const exists = store.facts.some(f => 
        f.subject === fact.subject && f.attribute === fact.attribute
      );
      
      if (!exists) {
        updatedStore = addFact(updatedStore, {
          ...fact,
          chapterEstablished: chapter.number,
        });
      }
    }

    return updatedStore;
  } catch (error) {
    console.warn('Failed to extract canon from chapter:', error);
    return store;
  }
}
