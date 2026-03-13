import { getLLM } from '../llm/client.js';
import type { Scene, SceneOutput, StoryBible, StoryState } from '../types/index.js';

interface SceneWriterInput {
  scene: Scene;
  bible: StoryBible;
  state: StoryState;
  chapterNumber: number;
  previousSceneSummary?: string;
  canonFacts?: string[];
  relevantMemories?: string[];
  activeSkills?: string[];
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
    canonFacts = [],
    relevantMemories = [],
    activeSkills = []
  } = input;
  
  const llm = getLLM();
  
  // Get character details for scene characters
  const sceneCharacters = bible.characters.filter(c => 
    scene.characters.includes(c.name)
  );
  
  const languageName = bible.language === 'zh' ? 'Chinese' : bible.language === 'ja' ? 'Japanese' : bible.language === 'ko' ? 'Korean' : bible.language === 'ar' ? 'Arabic' : bible.language === 'ru' ? 'Russian' : bible.language === 'es' ? 'Spanish' : bible.language === 'fr' ? 'French' : bible.language === 'de' ? 'German' : 'English';
  
  const prompt = `You are a professional novelist writing immersive narrative prose.

Write Scene ${scene.id} of Chapter ${chapterNumber} for "${bible.title}".

## Scene Information
Location: ${scene.location}
Characters Present: ${scene.characters.join(', ')}
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

${canonFacts.length > 0 ? `## Canon Facts (Must Respect)\n${canonFacts.map(f => `- ${f}`).join('\n')}\n` : ''}

${relevantMemories.length > 0 ? `## Relevant Story Memories\n${relevantMemories.map(m => `- ${m}`).join('\n')}\n` : ''}

${activeSkills.length > 0 ? `## Active Writing Skills\n${activeSkills.map(s => `- ${s}`).join('\n')}\n` : ''}

## Writing Instructions
1. Write immersive, engaging narrative prose
2. Show, don't tell - use sensory details
3. Stay focused on THIS scene only - don't rush to resolve everything
4. Maintain the target tension level (${scene.tension}/10)
5. End naturally so the next scene can continue
6. Do NOT include scene headings or "Scene X" labels
7. Do NOT summarize - write the actual scene content

Return a JSON object:
{
  "content": "the full scene text (3-5 paragraphs)",
  "summary": "brief 1-2 sentence summary of what happened",
  "wordCount": number
}

Return ONLY the JSON object.`;

  try {
    const response = await llm.complete(prompt, { 
      temperature: 0.8,
      maxTokens: 2500 
    });
    
    // Clean up response and parse JSON
    const cleaned = response.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
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
    console.error('Scene writing failed:', error);
    
    // Fallback: generate basic scene
    return createFallbackScene(scene, bible, chapterNumber);
  }
}

function createFallbackScene(scene: Scene, bible: StoryBible, chapterNumber: number): SceneOutput {
  const mainCharacter = scene.characters[0] || 'The protagonist';
  const location = scene.location;
  
  let content = '';
  
  switch (scene.type) {
    case 'dialogue':
      content = `${mainCharacter} stood in the ${location}, the weight of the situation pressing down. "We need to talk," ${mainCharacter} said, voice steady despite the tension. The conversation that followed would change everything, words hanging in the air like unspent lightning. Each sentence carried the burden of what had come before and the uncertainty of what lay ahead.`;
      break;
    case 'action':
      content = `The ${location} erupted into chaos. ${mainCharacter} moved quickly, instincts taking over as events unfolded. There was no time to think, only to act. The scene blurred into a series of decisive moments - each one carrying the story forward, each one irreversible.`;
      break;
    case 'reveal':
      content = `In the ${location}, the truth finally emerged. ${mainCharacter} stood frozen as understanding dawned. The pieces clicked into place - the mystery that had haunted them, the secret kept hidden for so long. Nothing would be the same after this moment.`;
      break;
    default:
      content = `${mainCharacter} entered the ${location}, senses alert. The scene unfolded naturally - characters moving through space, time passing, the story advancing one moment at a time. ${scene.purpose}. The narrative flowed like water, carrying everyone toward an uncertain future.`;
  }
  
  return {
    content,
    summary: `${mainCharacter} in ${location}: ${scene.purpose}`,
    wordCount: content.split(/\s+/).length
  };
}
