import { getLLM } from '../llm/client.js';
import type { StoryBible, StoryState, ChapterSummary } from '../types/index.js';
import type { StoryStructuredState } from '../story/structuredState.js';
import type { TensionGuidance } from './tensionController.js';

export interface ChapterObjective {
  id: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'plot' | 'character' | 'world' | 'tension' | 'resolution';
  relatedPlotThreadId?: string;
  relatedCharacter?: string;
}

export interface DirectorOutput {
  chapterNumber: number;
  overallGoal: string;
  objectives: ChapterObjective[];
  focusCharacters: string[];
  suggestedScenes: string[];
  tone: string;
  notes: string;
}

export interface DirectorContext {
  bible: StoryBible;
  state: StoryState;
  structuredState: StoryStructuredState;
  tensionGuidance: TensionGuidance;
  previousSummaries: ChapterSummary[];
}

const STORY_DIRECTOR_PROMPT = `You are the Story Director for a narrative AI system. Your job is to decide what the next chapter should accomplish.

## Story Bible

**Title:** {{title}}
**Genre:** {{genre}}
**Theme:** {{theme}}
**Premise:** {{premise}}

## Current Story State

**Chapter:** {{currentChapter}} / {{totalChapters}}
**Story Tension:** {{storyTension}}%
**Target Tension:** {{targetTension}}%

### Active Plot Threads
{{plotThreads}}

### Character States
{{characters}}

### Unresolved Questions
{{questions}}

### Recent Events
{{recentEvents}}

## Tension Guidance

{{tensionGuidance}}

## Previous Chapter Summaries
{{summaries}}

## Your Task

Based on all the above information, decide what Chapter {{nextChapter}} should accomplish. Consider:

1. **Plot Progression**: Which plot threads need advancement?
2. **Character Development**: Which characters need focus or growth?
3. **Tension Management**: How should tension change based on target?
4. **Unresolved Questions**: Which mysteries should be addressed?
5. **Story Arc**: Where are we in the overall narrative (setup/rising action/climax/resolution)?

Output a JSON object with:

{
  "chapterNumber": {{nextChapter}},
  "overallGoal": "One-sentence description of what this chapter achieves",
  "objectives": [
    {
      "id": "unique-id",
      "description": "What needs to happen",
      "priority": "critical|high|medium|low",
      "type": "plot|character|world|tension|resolution",
      "relatedPlotThreadId": "thread-id or omit",
      "relatedCharacter": "character name or omit"
    }
  ],
  "focusCharacters": ["Character names that should be central"],
  "suggestedScenes": ["Scene ideas that could achieve objectives"],
  "tone": "emotional tone for this chapter",
  "notes": "Additional guidance for the writer"
}

Be specific and actionable. The writer will use your direction to craft the chapter.`;

export class StoryDirector {
  async direct(context: DirectorContext): Promise<DirectorOutput> {
    const { bible, state, structuredState, tensionGuidance, previousSummaries } = context;
    
    const prompt = this.buildPrompt(bible, state, structuredState, tensionGuidance, previousSummaries);
    
    const result = await getLLM().completeJSON<DirectorOutput>(prompt, {
      temperature: 0.4,
      maxTokens: 2000,
    });
    
    return result;
  }
  
  private buildPrompt(
    bible: StoryBible,
    state: StoryState,
    structuredState: StoryStructuredState,
    tensionGuidance: TensionGuidance,
    summaries: ChapterSummary[]
  ): string {
    const currentTension = Math.round(structuredState.tension * 100);
    const targetTension = Math.round(tensionGuidance.targetTension * 100);
    
    // Format plot threads
    const activeThreads = Object.values(structuredState.plotThreads)
      .filter(t => t.status !== 'resolved')
      .map(t => `- **${t.name}** (${t.status}, ${Math.round(t.tension * 100)}% tension): ${t.summary}`)
      .join('\n') || 'No active plot threads.';
    
    // Format characters
    const characters = Object.values(structuredState.characters)
      .map(c => `- **${c.name}**: ${c.emotionalState}, at ${c.location}`)
      .join('\n') || 'No character data.';
    
    // Format questions
    const questions = structuredState.unresolvedQuestions.length > 0
      ? structuredState.unresolvedQuestions.map(q => `- ${q}`).join('\n')
      : 'None';
    
    // Format recent events
    const recentEvents = structuredState.recentEvents.length > 0
      ? structuredState.recentEvents.slice(-5).map(e => `- ${e}`).join('\n')
      : 'None';
    
    // Format tension guidance
    const tensionText = `Target: ${targetTension}%
Guidance: ${tensionGuidance.guidance}
Scene Types: ${tensionGuidance.sceneTypes.join(', ')}
Pacing: ${tensionGuidance.pacingNotes}`;
    
    // Format summaries (last 3)
    const recentSummaries = summaries.slice(-3);
    const summariesText = recentSummaries.length > 0
      ? recentSummaries.map(s => `Chapter ${s.chapterNumber}: ${s.summary}`).join('\n')
      : 'No previous chapters.';
    
    return STORY_DIRECTOR_PROMPT
      .replace('{{title}}', bible.title)
      .replace('{{genre}}', bible.genre)
      .replace('{{theme}}', bible.theme)
      .replace('{{premise}}', bible.premise)
      .replace('{{currentChapter}}', state.currentChapter.toString())
      .replace('{{totalChapters}}', state.totalChapters.toString())
      .replace('{{storyTension}}', currentTension.toString())
      .replace('{{targetTension}}', targetTension.toString())
      .replace('{{plotThreads}}', activeThreads)
      .replace('{{characters}}', characters)
      .replace('{{questions}}', questions)
      .replace('{{recentEvents}}', recentEvents)
      .replace('{{tensionGuidance}}', tensionText)
      .replace('{{summaries}}', summariesText)
      .replace(/{{nextChapter}}/g, (state.currentChapter + 1).toString());
  }
  
  /**
   * Format director output for writer prompt
   */
  formatForPrompt(output: DirectorOutput): string {
    const lines: string[] = ['## Chapter Direction'];
    
    lines.push(`\n**Chapter ${output.chapterNumber} Goal:** ${output.overallGoal}`);
    lines.push(`\n**Tone:** ${output.tone}`);
    
    if (output.focusCharacters.length > 0) {
      lines.push(`\n**Focus Characters:** ${output.focusCharacters.join(', ')}`);
    }
    
    if (output.objectives.length > 0) {
      lines.push('\n**Objectives (in priority order):**');
      const sorted = [...output.objectives].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      for (const obj of sorted) {
        const emoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[obj.priority];
        lines.push(`${emoji} **[${obj.type.toUpperCase()}]** ${obj.description}`);
      }
    }
    
    if (output.suggestedScenes.length > 0) {
      lines.push('\n**Suggested Scenes:**');
      for (const scene of output.suggestedScenes) {
        lines.push(`- ${scene}`);
      }
    }
    
    if (output.notes) {
      lines.push(`\n**Director's Notes:** ${output.notes}`);
    }
    
    return lines.join('\n');
  }
  
  /**
   * Get quick objectives without LLM call (for testing/fallback)
   */
  generateFallbackObjectives(
    state: StoryState,
    structuredState: StoryStructuredState
  ): DirectorOutput {
    const nextChapter = state.currentChapter + 1;
    const objectives: ChapterObjective[] = [];
    
    // Add plot thread objectives
    const activeThreads = Object.values(structuredState.plotThreads)
      .filter(t => t.status === 'active' || t.status === 'escalating');
    
    for (const thread of activeThreads.slice(0, 2)) {
      objectives.push({
        id: `plot-${thread.id}`,
        description: `Advance the "${thread.name}" plot thread`,
        priority: 'high',
        type: 'plot',
        relatedPlotThreadId: thread.id,
      });
    }
    
    // Add character objective
    const characters = Object.values(structuredState.characters);
    if (characters.length > 0) {
      const char = characters[nextChapter % characters.length];
      objectives.push({
        id: `char-${char.name}`,
        description: `Develop ${char.name}'s character arc`,
        priority: 'medium',
        type: 'character',
        relatedCharacter: char.name,
      });
    }
    
    // Add tension objective if needed
    const targetTension = 4 * (nextChapter / state.totalChapters) * (1 - nextChapter / state.totalChapters);
    if (structuredState.tension < targetTension - 0.2) {
      objectives.push({
        id: 'tension-escalate',
        description: 'Escalate tension toward target level',
        priority: 'high',
        type: 'tension',
      });
    }
    
    return {
      chapterNumber: nextChapter,
      overallGoal: `Advance the story toward chapter ${nextChapter} with focus on active plot threads`,
      objectives,
      focusCharacters: characters.slice(0, 2).map(c => c.name),
      suggestedScenes: ['Opening scene establishing current situation', 'Development of main plot thread', 'Character interaction moment'],
      tone: 'dramatic',
      notes: 'Auto-generated objectives based on current story state',
    };
  }
}

export const storyDirector = new StoryDirector();
