import { getLLM } from '../llm/client.js';
import type { StoryBible, StoryState } from '../types/index.js';
import type { StoryStructuredState } from '../story/structuredState.js';
import type { DirectorOutput, ChapterObjective } from './storyDirector.js';

export interface Scene {
  id: string;
  sequence: number;
  goal: string;
  description: string;
  tension: number; // 0.0 to 1.0
  characters: string[];
  setting: string;
  estimatedWords: number;
}

export interface ChapterOutline {
  chapterNumber: number;
  overallGoal: string;
  tone: string;
  totalEstimatedWords: number;
  scenes: Scene[];
  transitions: string[];
  notes: string;
}

export interface PlannerContext {
  bible: StoryBible;
  state: StoryState;
  structuredState: StoryStructuredState;
  directorOutput: DirectorOutput;
  targetWordCount?: number;
}

const CHAPTER_PLANNER_PROMPT = `You are the Chapter Planner for a narrative AI system. Convert chapter objectives into a detailed scene-by-scene outline.

## Story Context

**Title:** {{title}}
**Genre:** {{genre}}
**Setting:** {{setting}}

## Chapter Direction

**Chapter:** {{chapterNumber}}
**Overall Goal:** {{overallGoal}}
**Tone:** {{tone}}
**Target Word Count:** {{targetWordCount}}

### Objectives (in priority order)
{{objectives}}

### Focus Characters
{{focusCharacters}}

### Suggested Scenes
{{suggestedScenes}}

## Current Story State

**Story Tension:** {{storyTension}}%
**Target Tension:** {{targetTension}}%

### Character States
{{characters}}

### Active Plot Threads
{{plotThreads}}

## Your Task

Create a detailed scene-by-scene outline for this chapter. Each scene should:
1. Have a clear goal that serves the chapter objectives
2. Build tension progressively toward the chapter climax
3. Include specific characters and setting
4. Have an estimated word count (scenes typically 300-800 words)

Output JSON with this structure:

{
  "chapterNumber": {{chapterNumber}},
  "overallGoal": "{{overallGoal}}",
  "tone": "{{tone}}",
  "totalEstimatedWords": 2500,
  "scenes": [
    {
      "id": "scene-1",
      "sequence": 1,
      "goal": "What this scene accomplishes",
      "description": "Detailed description of what happens",
      "tension": 0.2,
      "characters": ["Character names present"],
      "setting": "Where scene takes place",
      "estimatedWords": 400
    }
  ],
  "transitions": ["How scenes connect"],
  "notes": "Additional guidance for the writer"
}

Guidelines:
- Create 3-6 scenes per chapter
- Tension should build progressively (low → medium → high)
- Each scene should serve at least one objective
- Opening scene: establish situation
- Middle scenes: develop conflict, advance objectives
- Final scene: climax or resolution hook
- Total word count should match target (default ~2500)`;

export class ChapterPlanner {
  async plan(context: PlannerContext): Promise<ChapterOutline> {
    const { bible, state, structuredState, directorOutput, targetWordCount = 2500 } = context;
    
    const prompt = this.buildPrompt(bible, state, structuredState, directorOutput, targetWordCount);
    
    const result = await getLLM().completeJSON<ChapterOutline>(prompt, {
      temperature: 0.4,
      maxTokens: 2500,
    });
    
    return result;
  }
  
  private buildPrompt(
    bible: StoryBible,
    state: StoryState,
    structuredState: StoryStructuredState,
    directorOutput: DirectorOutput,
    targetWordCount: number
  ): string {
    const currentTension = Math.round(structuredState.tension * 100);
    const targetTension = Math.round(
      4 * (state.currentChapter / state.totalChapters) * (1 - state.currentChapter / state.totalChapters) * 100
    );
    
    // Format objectives
    const objectives = directorOutput.objectives
      .map(obj => {
        const priorityEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[obj.priority];
        return `${priorityEmoji} [${obj.type.toUpperCase()}] ${obj.description}`;
      })
      .join('\n');
    
    // Format characters
    const characters = Object.values(structuredState.characters)
      .map(c => `- ${c.name}: ${c.emotionalState}, at ${c.location}`)
      .join('\n') || 'No character data.';
    
    // Format plot threads
    const plotThreads = Object.values(structuredState.plotThreads)
      .filter(t => t.status !== 'resolved')
      .map(t => `- ${t.name} (${t.status}, ${Math.round(t.tension * 100)}% tension)`)
      .join('\n') || 'No active plot threads.';
    
    // Format suggested scenes
    const suggestedScenes = directorOutput.suggestedScenes
      .map(s => `- ${s}`)
      .join('\n') || 'No suggestions.';
    
    return CHAPTER_PLANNER_PROMPT
      .replace('{{title}}', bible.title)
      .replace('{{genre}}', bible.genre)
      .replace('{{setting}}', bible.setting)
      .replace(/{{chapterNumber}}/g, directorOutput.chapterNumber.toString())
      .replace('{{overallGoal}}', directorOutput.overallGoal)
      .replace('{{tone}}', directorOutput.tone)
      .replace('{{targetWordCount}}', `${targetWordCount} words`)
      .replace('{{objectives}}', objectives)
      .replace('{{focusCharacters}}', directorOutput.focusCharacters.join(', '))
      .replace('{{suggestedScenes}}', suggestedScenes)
      .replace('{{storyTension}}', currentTension.toString())
      .replace('{{targetTension}}', targetTension.toString())
      .replace('{{characters}}', characters)
      .replace('{{plotThreads}}', plotThreads);
  }
  
  /**
   * Format chapter outline for writer prompt
   */
  formatForPrompt(outline: ChapterOutline): string {
    const lines: string[] = ['## Chapter Outline'];
    
    lines.push(`\n**Chapter ${outline.chapterNumber}: ${outline.overallGoal}**`);
    lines.push(`**Tone:** ${outline.tone}`);
    lines.push(`**Estimated Length:** ${outline.totalEstimatedWords} words`);
    
    if (outline.scenes.length > 0) {
      lines.push('\n### Scene Breakdown');
      
      for (const scene of outline.scenes) {
        const tensionBar = '█'.repeat(Math.round(scene.tension * 10)) + '░'.repeat(10 - Math.round(scene.tension * 10));
        lines.push(`\n**Scene ${scene.sequence}** [${tensionBar}] ${Math.round(scene.tension * 100)}% tension`);
        lines.push(`- **Goal:** ${scene.goal}`);
        lines.push(`- **Setting:** ${scene.setting}`);
        lines.push(`- **Characters:** ${scene.characters.join(', ')}`);
        lines.push(`- **Description:** ${scene.description}`);
        lines.push(`- **Estimated:** ${scene.estimatedWords} words`);
      }
    }
    
    if (outline.transitions.length > 0) {
      lines.push('\n### Scene Transitions');
      for (let i = 0; i < outline.transitions.length; i++) {
        lines.push(`${i + 1} → ${i + 2}: ${outline.transitions[i]}`);
      }
    }
    
    if (outline.notes) {
      lines.push(`\n**Planner Notes:** ${outline.notes}`);
    }
    
    return lines.join('\n');
  }
  
  /**
   * Generate fallback outline without LLM
   */
  generateFallbackOutline(
    directorOutput: DirectorOutput,
    targetWordCount: number = 2500
  ): ChapterOutline {
    const scenes: Scene[] = [];
    const sceneCount = Math.max(3, Math.min(6, Math.floor(targetWordCount / 500)));
    const wordsPerScene = Math.floor(targetWordCount / sceneCount);
    
    // Build scenes based on objectives
    const criticalObjectives = directorOutput.objectives.filter(o => o.priority === 'critical');
    const highObjectives = directorOutput.objectives.filter(o => o.priority === 'high');
    
    // Scene 1: Setup
    scenes.push({
      id: 'scene-1',
      sequence: 1,
      goal: 'Establish current situation and character states',
      description: 'Opening scene that sets up the chapter context',
      tension: 0.2,
      characters: directorOutput.focusCharacters.slice(0, 2),
      setting: 'Current location',
      estimatedWords: wordsPerScene,
    });
    
    // Middle scenes: Build tension and address objectives
    for (let i = 2; i < sceneCount; i++) {
      const tension = 0.3 + (i / sceneCount) * 0.5; // Build from 30% to 80%
      const objective = criticalObjectives[i - 2] || highObjectives[i - 2];
      
      scenes.push({
        id: `scene-${i}`,
        sequence: i,
        goal: objective ? `Address: ${objective.description.substring(0, 50)}...` : 'Develop plot and character',
        description: objective 
          ? `Scene focusing on ${objective.type} objective related to ${objective.relatedCharacter || 'plot'}`
          : 'Development scene advancing the story',
        tension: Math.round(tension * 100) / 100,
        characters: directorOutput.focusCharacters,
        setting: 'Story location',
        estimatedWords: wordsPerScene,
      });
    }
    
    // Final scene: Climax/Resolution
    scenes.push({
      id: `scene-${sceneCount}`,
      sequence: sceneCount,
      goal: criticalObjectives[0]?.description || 'Chapter climax or resolution',
      description: 'Climactic scene that resolves or escalates the chapter tension',
      tension: 0.9,
      characters: directorOutput.focusCharacters,
      setting: 'Key location',
      estimatedWords: wordsPerScene,
    });
    
    // Generate transitions
    const transitions: string[] = [];
    for (let i = 0; i < scenes.length - 1; i++) {
      transitions.push(`Natural progression from ${scenes[i].goal} to ${scenes[i + 1].goal}`);
    }
    
    return {
      chapterNumber: directorOutput.chapterNumber,
      overallGoal: directorOutput.overallGoal,
      tone: directorOutput.tone,
      totalEstimatedWords: scenes.reduce((sum, s) => sum + s.estimatedWords, 0),
      scenes,
      transitions,
      notes: 'Auto-generated outline based on director objectives. Adjust as needed for narrative flow.',
    };
  }
  
  /**
   * Validate that outline meets objectives
   */
  validateOutline(outline: ChapterOutline, objectives: ChapterObjective[]): {
    valid: boolean;
    coverage: number;
    missedObjectives: string[];
  } {
    const covered = new Set<string>();
    const missed: string[] = [];
    
    // Check each objective against scenes
    for (const obj of objectives) {
      const isCovered = outline.scenes.some(scene => 
        scene.goal.toLowerCase().includes(obj.type) ||
        scene.description.toLowerCase().includes(obj.description.toLowerCase().substring(0, 20))
      );
      
      if (isCovered) {
        covered.add(obj.id);
      } else if (obj.priority === 'critical' || obj.priority === 'high') {
        missed.push(obj.description);
      }
    }
    
    const coverage = objectives.length > 0 ? covered.size / objectives.length : 1;
    
    return {
      valid: missed.length === 0,
      coverage,
      missedObjectives: missed,
    };
  }
}

export const chapterPlanner = new ChapterPlanner();
