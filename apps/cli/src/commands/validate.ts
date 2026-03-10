import { createConstraintGraph, Validator, getVectorStore } from '@narrative-os/engine';
import { loadStory, loadVectorStore, loadConstraintGraph } from '../config/store.js';

export async function validateCommand(storyId: string) {
  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  const { bible, state, chapters, canon, structuredState } = story;
  
  console.log(`\nValidating Story: ${bible.title}`);
  console.log('─'.repeat(60));
  
  // Load constraint graph if exists
  const constraintGraph = createConstraintGraph();
  const graphData = loadConstraintGraph(storyId);
  if (graphData) {
    constraintGraph.load(graphData);
  }
  
  // Load vector store if exists
  const vectorStore = getVectorStore(storyId);
  const vectorData = loadVectorStore(storyId);
  if (vectorData) {
    await vectorStore.load(vectorData);
  }
  
  console.log(`\n## Story Statistics`);
  console.log(`  Chapters: ${chapters.length} / ${state.totalChapters}`);
  console.log(`  Canon Facts: ${canon.facts.length}`);
  console.log(`  Constraint Graph: ${constraintGraph.getStats().nodes} nodes, ${constraintGraph.getStats().edges} edges`);
  console.log(`  Vector Memories: ${vectorStore.getAllMemories().length}`);
  
  // Validate each chapter
  if (chapters.length > 0 && structuredState) {
    console.log(`\n## Chapter Validation`);
    console.log('─'.repeat(60));
    
    const validator = new Validator(constraintGraph);
    let totalViolations = 0;
    
    for (const chapter of chapters) {
      const result = validator.quickValidate({
        chapter,
        bible,
        structuredState,
        canon,
        previousChapters: chapters.filter(ch => ch.number < chapter.number),
        constraintGraph,
      });
      
      const errors = result.violations.filter(v => v.severity === 'error').length;
      const warnings = result.violations.filter(v => v.severity === 'warning').length;
      
      if (errors > 0 || warnings > 0) {
        console.log(`\n  Chapter ${chapter.number}: ${chapter.title}`);
        if (errors > 0) console.log(`    ❌ ${errors} error(s)`);
        if (warnings > 0) console.log(`    ⚠️  ${warnings} warning(s)`);
        totalViolations += result.violations.length;
      }
    }
    
    if (totalViolations === 0) {
      console.log('  ✅ All chapters pass validation!');
    } else {
      console.log(`\n  Total: ${totalViolations} violation(s) found`);
    }
  }
  
  // Check for common issues
  console.log(`\n## Consistency Checks`);
  console.log('─'.repeat(60));
  
  const issues: string[] = [];
  
  // Check for chapters without summaries
  const noSummary = chapters.filter(ch => !ch.summary || ch.summary.length < 10);
  if (noSummary.length > 0) {
    issues.push(`${noSummary.length} chapter(s) missing summaries`);
  }
  
  // Check for very short chapters
  const shortChapters = chapters.filter(ch => ch.wordCount < 500);
  if (shortChapters.length > 0) {
    issues.push(`${shortChapters.length} chapter(s) unusually short (< 500 words)`);
  }
  
  // Check for canon facts without chapters
  const orphanedFacts = canon.facts.filter(f => f.chapterEstablished > state.currentChapter);
  if (orphanedFacts.length > 0) {
    issues.push(`${orphanedFacts.length} canon fact(s) from future chapters`);
  }
  
  if (issues.length === 0) {
    console.log('  ✅ No issues found!');
  } else {
    for (const issue of issues) {
      console.log(`  ⚠️  ${issue}`);
    }
  }
  
  console.log('\n');
}
