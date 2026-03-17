import { getLLM } from '../llm/client.js';
import type { Scene, SceneOutput, StoryBible, StoryState } from '../types/index.js';

interface SceneWriterInput {
  scene: Scene;
  bible: StoryBible;
  state: StoryState;
  chapterNumber: number;
  previousSceneSummary?: string;
  previousSceneEnding?: string; // Last ~200 chars of previous scene for transition
  canonFacts?: string[];
  relevantMemories?: string[];
  activeSkills?: string[];
  characterDecisions?: string[]; // Character agent decisions for this scene
}

/**
 * SceneWriter generates a single scene based on the scene plan
 * Focuses on immersive narrative prose for one specific scene
 */
export async function writeScene(input: SceneWriterInput): Promise<SceneOutput> {
  const { 
    scene, 
    bible, 
    state, 
    chapterNumber, 
    previousSceneSummary,
    previousSceneEnding,
    canonFacts = [],
    relevantMemories = [],
    activeSkills = [],
    characterDecisions = []
  } = input;
  
  const llm = getLLM();
  
  // Get character details for scene characters (if specified)
  const sceneCharacters = scene.characters 
    ? bible.characters.filter(c => scene.characters!.includes(c.name))
    : bible.characters.slice(0, 3); // Default to first 3 if not specified
  
  const languageName = bible.language === 'zh' ? 'Chinese' : bible.language === 'ja' ? 'Japanese' : bible.language === 'ko' ? 'Korean' : bible.language === 'ar' ? 'Arabic' : bible.language === 'ru' ? 'Russian' : bible.language === 'es' ? 'Spanish' : bible.language === 'fr' ? 'French' : bible.language === 'de' ? 'German' : 'English';
  
  const prompt = `You are a professional novelist writing immersive narrative prose.

Write Scene ${scene.id} of Chapter ${chapterNumber} for "${bible.title}".

## Scene Information
Location: ${scene.location || 'Writer decides organically'}
Characters Present: ${scene.characters?.join(', ') || 'Writer decides based on story needs'}
Scene Purpose: ${scene.purpose}
${scene.conflict ? `Conflict: ${scene.conflict}` : ''}
Target Tension: ${scene.tension}/10
Scene Type: ${scene.type || 'narrative'}
Language: ${languageName}

## Character Details
${sceneCharacters.map(c => `- ${c.name}: ${c.personality.join(', ')}. Goals: ${c.goals.join(', ')}`).join('\n')}

## Story Context
Genre: ${bible.genre}
Tone: ${bible.tone}
Theme: ${bible.theme}
Language: ${languageName}

IMPORTANT: Write this scene in ${languageName} language.

${previousSceneSummary ? `## Previous Scene Summary\n${previousSceneSummary}\n` : ''}

${previousSceneEnding ? `## Transition from Previous Scene\nThe previous scene ended with:
"${previousSceneEnding}"

Begin this scene by naturally continuing from where the previous scene left off. Do NOT repeat the same content, but smoothly transition into the new scene's action.\n` : ''}

${canonFacts.length > 0 ? `## Canon Facts (Must Respect)\n${canonFacts.map(f => `- ${f}`).join('\n')}\n` : ''}

${relevantMemories.length > 0 ? `## Relevant Story Memories\n${relevantMemories.map(m => `- ${m}`).join('\n')}\n` : ''}

${activeSkills.length > 0 ? `## Active Writing Skills\n${activeSkills.map(s => `- ${s}`).join('\n')}\n` : ''}

${characterDecisions.length > 0 ? `## Character Decisions (Incorporate Naturally)\n${characterDecisions.map(d => `- ${d}`).join('\n')}\n` : ''}

## Writing Instructions
1. Write immersive, engaging narrative prose in ${languageName} ONLY
2. Show, don't tell - use sensory details
3. Stay focused on THIS scene only - don't rush to resolve everything
4. Maintain the target tension level (${scene.tension}/10)
5. End naturally so the next scene can continue - leave a subtle hook or transition point
6. Do NOT include scene headings or "Scene X" labels
7. Do NOT summarize - write the actual scene content
8. Do NOT mix languages - use ${languageName} exclusively
9. Do NOT include meta-commentary about the writing process
10. Incorporate character decisions naturally into the narrative flow
11. If this is NOT the first scene, begin by smoothly transitioning from the previous scene's ending

Return a JSON object:
{
  "content": "the full scene text (8-12 paragraphs, 800-1200 words)",
  "summary": "brief 1-2 sentence summary of what happened",
  "wordCount": number
}

Return ONLY the JSON object.`;

  try {
    const response = await llm.complete(prompt, { 
      temperature: 0.8,
      maxTokens: 4000 
    });
    
    // Clean up response and parse JSON
    let cleaned = response.trim()
      .replace(/^```json\s*/, '')
      .replace(/```\s*$/, '')
      .trim();
    
    // Remove control characters that break JSON parsing
    // eslint-disable-next-line no-control-regex
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // Fix common JSON issues from LLM output
    cleaned = cleaned
      .replace(/\n/g, '\\n')  // Escape newlines in strings
      .replace(/\r/g, '')     // Remove carriage returns
      .replace(/\t/g, '\\t'); // Escape tabs
    
    // Try to extract JSON if wrapped in other text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    const output: SceneOutput = JSON.parse(cleaned);
    
    // Validate output
    if (!output.content || output.content.length < 100) {
      throw new Error('Scene content too short');
    }
    
    // Calculate actual word count if not provided
    if (!output.wordCount) {
      output.wordCount = output.content.split(/\s+/).length;
    }
    
    return output;
  } catch (error) {
    console.error('❌ Scene writing failed:', error);
    throw new Error(`Failed to write scene ${scene.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
