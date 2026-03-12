import { getLLM } from '../llm/client.js';
import type { ScenePlan, Scene, StoryBible, StoryState } from '../types/index.js';

interface ScenePlannerInput {
  bible: StoryBible;
  state: StoryState;
  chapterNumber: number;
  previousChapterSummary?: string;
  targetSceneCount?: number;
}

/**
 * ScenePlanner breaks down a chapter into individual scenes
 * Each scene has a specific purpose, location, characters, and tension level
 */
export async function planScenes(input: ScenePlannerInput): Promise<ScenePlan> {
  const { bible, state, chapterNumber, previousChapterSummary, targetSceneCount = 4 } = input;
  
  const llm = getLLM();
  
  const prompt = `You are a professional story planner. Break down Chapter ${chapterNumber} into ${targetSceneCount} scenes.

Story Title: ${bible.title}
Genre: ${bible.genre}
Theme: ${bible.theme}
Tone: ${bible.tone}

Story Premise: ${bible.premise}

Characters:
${bible.characters.map(c => `- ${c.name} (${c.role}): ${c.personality.join(', ')}`).join('\n')}

Plot Threads:
${bible.plotThreads.filter(p => p.status !== 'resolved').map(p => `- ${p.name} (${p.status}, tension: ${p.tension})`).join('\n')}

Current Story State:
- Chapter: ${chapterNumber} of ${state.totalChapters}
- Current Tension: ${state.currentTension}/10
- Active Plot Threads: ${state.activePlotThreads.join(', ')}

${previousChapterSummary ? `Previous Chapter Summary:\n${previousChapterSummary}\n` : ''}

Chapter Goal for Chapter ${chapterNumber}:
- Advance the main plot
- Develop character relationships
- Build tension toward the story climax
- Target tension progression: ${state.currentTension} → ${Math.min(state.currentTension + 2, 10)}

Create ${targetSceneCount} scenes for this chapter. Each scene should:
1. Have a clear purpose that advances plot or character
2. Include specific characters present
3. Take place in a specific location
4. Have a target tension level (0-10)
5. Build toward the next scene

Return a JSON object with this structure:
{
  "scenes": [
    {
      "id": 1,
      "location": "specific location name",
      "characters": ["character names present"],
      "purpose": "what happens in this scene",
      "tension": 5,
      "conflict": "optional conflict description",
      "type": "dialogue|action|reveal|investigation|transition"
    }
  ],
  "chapterGoal": "overall goal for this chapter",
  "targetTension": 7
}

Make scenes flow naturally:
- Scene 1: Hook/Setup
- Scene 2: Development/Rising action
- Scene 3: Climax/Confrontation
- Scene 4: Resolution/Transition

Return ONLY the JSON object, no markdown formatting.`;

  try {
    const response = await llm.complete(prompt, { 
      temperature: 0.7,
      maxTokens: 2000 
    });
    
    // Clean up response and parse JSON
    const cleaned = response.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
    const plan: ScenePlan = JSON.parse(cleaned);
    
    // Validate the plan
    if (!plan.scenes || plan.scenes.length === 0) {
      throw new Error('Scene plan returned no scenes');
    }
    
    // Ensure scene IDs are sequential
    plan.scenes = plan.scenes.map((scene, idx) => ({
      ...scene,
      id: idx + 1
    }));
    
    return plan;
  } catch (error) {
    console.error('Scene planning failed:', error);
    
    // Fallback: create basic scene plan
    return createFallbackScenePlan(bible, chapterNumber, targetSceneCount);
  }
}

function createFallbackScenePlan(bible: StoryBible, chapterNumber: number, targetSceneCount: number): ScenePlan {
  const mainCharacter = bible.characters.find(c => c.role === 'protagonist')?.name || 'Protagonist';
  const antagonist = bible.characters.find(c => c.role === 'antagonist')?.name;
  const setting = bible.setting || 'Unknown location';
  
  const scenes: Scene[] = [
    {
      id: 1,
      location: setting,
      characters: [mainCharacter],
      purpose: `${mainCharacter} begins their journey, setting up the chapter's conflict`,
      tension: 3,
      type: 'transition'
    },
    {
      id: 2,
      location: setting,
      characters: antagonist ? [mainCharacter, antagonist] : [mainCharacter],
      purpose: 'Rising action - complications arise',
      tension: 5,
      type: 'action'
    },
    {
      id: 3,
      location: setting,
      characters: antagonist ? [mainCharacter, antagonist] : [mainCharacter],
      purpose: 'Confrontation or major revelation',
      tension: 7,
      type: antagonist ? 'dialogue' : 'reveal',
      conflict: antagonist ? `Tension between ${mainCharacter} and ${antagonist}` : undefined
    },
    {
      id: 4,
      location: setting,
      characters: [mainCharacter],
      purpose: 'Resolution and transition to next chapter',
      tension: 4,
      type: 'transition'
    }
  ];
  
  // Adjust to target scene count
  while (scenes.length < targetSceneCount) {
    scenes.push({
      id: scenes.length + 1,
      location: setting,
      characters: [mainCharacter],
      purpose: 'Additional development scene',
      tension: 5,
      type: 'investigation'
    });
  }
  
  return {
    scenes: scenes.slice(0, targetSceneCount),
    chapterGoal: `Advance ${mainCharacter}'s journey in Chapter ${chapterNumber}`,
    targetTension: 7
  };
}
