import { writer } from '../agents/writer.js';
import { completenessChecker } from '../agents/completeness.js';
import { summarizer } from '../agents/summarizer.js';
import { canonValidator } from '../agents/canonValidator.js';
import type { GenerationContext, Chapter, ChapterSummary } from '../types/index.js';
import type { CanonStore } from '../memory/canonStore.js';

export interface GenerateChapterResult {
  chapter: Chapter;
  summary: ChapterSummary;
  violations: string[];
}

export interface GenerateChapterOptions {
  canon?: CanonStore;
  validateCanon?: boolean;
  maxContinuationAttempts?: number;
}

export async function generateChapter(
  context: GenerationContext,
  options: GenerateChapterOptions = {}
): Promise<GenerateChapterResult> {
  const { bible, state, chapterNumber } = context;
  const { canon, validateCanon = true, maxContinuationAttempts = 3 } = options;

  console.log(`Generating Chapter ${chapterNumber}...`);

  let output = await writer.write(context, canon);
  let attempts = 0;

  while (attempts < maxContinuationAttempts) {
    const check = await completenessChecker.check(output.content);
    
    if (check.isComplete) {
      break;
    }

    console.log(`  Chapter incomplete, continuing... (attempt ${attempts + 1})`);
    output.content = await writer.continue(output.content, context);
    output.wordCount = output.content.split(/\s+/).length;
    attempts++;
  }

  let violations: string[] = [];
  if (validateCanon && canon) {
    console.log('  Validating canon...');
    const validation = await canonValidator.validate(output.content, canon);
    violations = validation.violations;
    if (violations.length > 0) {
      console.log(`  ⚠️  Canon violations detected: ${violations.length}`);
    }
  }

  const summary = await summarizer.summarize(output.content, chapterNumber);

  const chapter: Chapter = {
    id: generateId(),
    storyId: bible.id,
    number: chapterNumber,
    title: output.title,
    content: output.content,
    summary: summary.summary,
    wordCount: output.wordCount,
    generatedAt: new Date(),
  };

  console.log(`  Generated: ${output.wordCount} words`);

  return { chapter, summary, violations };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
