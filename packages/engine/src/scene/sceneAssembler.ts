import type { SceneOutput, ScenePlan } from '../types/index.js';

interface AssembledChapter {
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  sceneCount: number;
}

/**
 * SceneAssembler combines individual scenes into a cohesive chapter
 */
export function assembleChapter(
  sceneOutputs: SceneOutput[],
  scenePlan: ScenePlan,
  chapterNumber: number,
  language?: string
): AssembledChapter {
  if (sceneOutputs.length === 0) {
    throw new Error('Cannot assemble chapter with no scenes');
  }
  
  // Generate chapter title from the scene plan
  const title = generateChapterTitle(scenePlan, chapterNumber);
  
  // Combine all scene content with proper transitions
  const content = combineScenes(sceneOutputs);
  
  // Generate chapter summary from scene summaries
  const summary = generateChapterSummary(sceneOutputs, scenePlan, language);
  
  // Calculate total word count
  const wordCount = sceneOutputs.reduce((sum, s) => sum + (s.wordCount || 0), 0);
  
  return {
    title,
    content,
    summary,
    wordCount,
    sceneCount: sceneOutputs.length
  };
}

function generateChapterTitle(scenePlan: ScenePlan, chapterNumber: number): string {
  // Use the chapter title from the plan if available
  if (scenePlan.chapterTitle && scenePlan.chapterTitle.length > 0) {
    return scenePlan.chapterTitle;
  }
  
  // Fallback to first scene's purpose
  const firstScene = scenePlan.scenes[0];
  if (firstScene && firstScene.purpose) {
    const purpose = firstScene.purpose;
    const shortPurpose = purpose.length > 30 ? purpose.substring(0, 30) + '...' : purpose;
    return shortPurpose;
  }
  
  // Final fallback
  return `Chapter ${chapterNumber}`;
}

function combineScenes(sceneOutputs: SceneOutput[]): string {
  const parts: string[] = [];
  
  for (let i = 0; i < sceneOutputs.length; i++) {
    const scene = sceneOutputs[i];
    
    // Add scene content
    parts.push(scene.content);
    
    // Add transition between scenes (except after last scene)
    if (i < sceneOutputs.length - 1) {
      parts.push(''); // Empty line for separation
    }
  }
  
  return parts.join('\n\n');
}

function generateChapterSummary(sceneOutputs: SceneOutput[], scenePlan: ScenePlan, language?: string): string {
  const summaries = sceneOutputs
    .map(s => s.summary)
    .filter(s => s && s.length > 0);
  
  if (summaries.length === 0) {
    return scenePlan.chapterGoal || 'Chapter completed';
  }
  
  // Combine scene summaries into chapter summary
  if (summaries.length === 1) {
    return summaries[0];
  }
  
  // For multiple scenes, create a flowing summary with language-appropriate connector
  const connector = language === 'zh' ? '。接着，' : 
                    language === 'ja' ? '。そして、' :
                    language === 'ko' ? '. 그리고 ' :
                    ' Then, ';
  const combined = summaries.join(connector);
  
  // Limit length
  if (combined.length > 300) {
    return combined.substring(0, 297) + '...';
  }
  
  return combined;
}

/**
 * Add chapter heading to content
 */
export function formatChapterWithHeading(
  content: string,
  title: string,
  chapterNumber: number
): string {
  const heading = `# Chapter ${chapterNumber}: ${title}\n\n`;
  return heading + content;
}
