import { getLLM } from '../llm/client.js';
import type { Chapter, StoryBible } from '../types/index.js';
import type { WorldStateEngine } from '../world/worldStateEngine.js';

export interface CharacterStrategy {
  character: string;
  currentGoal: string;
  longTermGoal: string;
  motivation: string;
  obstacles: string[];
  relationships: Record<string, 'ally' | 'enemy' | 'neutral' | 'suspicious'>;
  emotionalArc: 'rising' | 'falling' | 'stable';
  nextChapterTarget: string;
  isNewCharacter: boolean;
}

export interface CharacterStrategyInput {
  characterName: string;
  chapter: Chapter;
  bible: StoryBible;
  worldState: WorldStateEngine;
  previousStrategy?: CharacterStrategy;
}

const CHARACTER_STRATEGY_PROMPT = `You are a character strategist analyzing a character's role and goals in a narrative.

## Story Information
Title: {{title}}
Genre: {{genre}}

## Character
Name: {{characterName}}
Role in Story: {{characterRole}}
Background: {{characterBackground}}

## Chapter Context
Chapter {{chapterNumber}}: {{chapterTitle}}
Chapter Summary: {{chapterSummary}}

{{previousStrategySection}}

## Analysis Task

Analyze this character's current situation and determine:

1. **Current Goal** - What does the character want RIGHT NOW (short-term, immediate)?
2. **Long-term Goal** - What is their ultimate objective in the story?
3. **Motivation** - Why do they want this? (emotional driver)
4. **Obstacles** - What stands in their way?
5. **Relationships** - How do they view other key characters?
6. **Emotional Arc** - Is their emotional state rising (hopeful), falling (despair), or stable?
7. **Next Chapter Target** - What should they try to accomplish in the next chapter?

{{newCharacterSection}}

Respond with JSON only:
{
  "character": "{{characterName}}",
  "currentGoal": "specific short-term objective",
  "longTermGoal": "ultimate story objective",
  "motivation": "emotional reason for their goals",
  "obstacles": ["obstacle 1", "obstacle 2"],
  "relationships": {
    "OtherCharacterName": "ally|enemy|neutral|suspicious"
  },
  "emotionalArc": "rising|falling|stable",
  "nextChapterTarget": "specific target for next chapter",
  "isNewCharacter": {{isNew}}
}`;

export class CharacterStrategyAnalyzer {
  async analyze(input: CharacterStrategyInput): Promise<CharacterStrategy> {
    const { characterName, chapter, bible, worldState, previousStrategy } = input;
    
    // Get character info from bible
    const character = bible.characters.find(c => c.name === characterName);
    if (!character) {
      throw new Error(`Character ${characterName} not found in bible`);
    }
    
    // Get world state info
    const worldStateData = worldState.getState();
    const characterInWorld = worldStateData.characters[characterName];
    
    // Build prompt
    const isNewCharacter = !previousStrategy;
    const prompt = this.buildPrompt({
      character,
      chapter,
      bible,
      characterInWorld,
      previousStrategy,
      isNewCharacter
    });
    
    const result = await getLLM().completeJSON<CharacterStrategy>(prompt, {
      temperature: 0.4,
      maxTokens: 1500,
    });
    
    return {
      ...result,
      isNewCharacter
    };
  }
  
  private buildPrompt(params: {
    character: any;
    chapter: Chapter;
    bible: StoryBible;
    characterInWorld: any;
    previousStrategy?: CharacterStrategy;
    isNewCharacter: boolean;
  }): string {
    const { character, chapter, bible, characterInWorld, previousStrategy, isNewCharacter } = params;
    
    // Get other characters for relationship context
    const otherCharacters = bible.characters
      .filter(c => c.name !== character.name)
      .map(c => c.name)
      .join(', ');
    
    // Build previous strategy section
    let previousStrategySection = '';
    if (previousStrategy) {
      previousStrategySection = `
## Previous Strategy (Chapter ${chapter.number - 1})
Previous Goal: ${previousStrategy.currentGoal}
Previous Target: ${previousStrategy.nextChapterTarget}
Emotional Arc: ${previousStrategy.emotionalArc}

Note: Consider how events in the current chapter have changed this character's priorities.
`;
    }
    
    // Build new character section
    let newCharacterSection = '';
    if (isNewCharacter) {
      newCharacterSection = `
## IMPORTANT: New Character
This character just appeared in this chapter. 
Establish their:
- Initial motivation and goals
- First impression on other characters
- Role in the ongoing story
`;
    }
    
    return CHARACTER_STRATEGY_PROMPT
      .replace('{{title}}', bible.title)
      .replace('{{genre}}', bible.genre)
      .replace('{{characterName}}', character.name)
      .replace('{{characterRole}}', character.role)
      .replace('{{characterBackground}}', character.background || 'Unknown')
      .replace('{{chapterNumber}}', chapter.number.toString())
      .replace('{{chapterTitle}}', chapter.title)
      .replace('{{chapterSummary}}', chapter.summary || 'No summary available')
      .replace('{{previousStrategySection}}', previousStrategySection)
      .replace('{{newCharacterSection}}', newCharacterSection)
      .replace('{{isNew}}', isNewCharacter.toString());
  }
  
  /**
   * Detect conflicts between character strategies
   */
  detectConflicts(strategies: CharacterStrategy[]): Array<{
    characters: string[];
    conflictType: string;
    description: string;
  }> {
    const conflicts = [];
    
    // Check for goal collisions
    for (let i = 0; i < strategies.length; i++) {
      for (let j = i + 1; j < strategies.length; j++) {
        const char1 = strategies[i];
        const char2 = strategies[j];
        
        // Check if they want the same thing
        if (this.goalsConflict(char1.nextChapterTarget, char2.nextChapterTarget)) {
          conflicts.push({
            characters: [char1.character, char2.character],
            conflictType: 'goal_collision',
            description: `${char1.character} and ${char2.character} both want: ${char1.nextChapterTarget}`
          });
        }
        
        // Check for hostile relationships
        if (char1.relationships[char2.character] === 'enemy' || 
            char2.relationships[char1.character] === 'enemy') {
          conflicts.push({
            characters: [char1.character, char2.character],
            conflictType: 'hostile_relationship',
            description: `${char1.character} and ${char2.character} are enemies`
          });
        }
      }
    }
    
    return conflicts;
  }
  
  private goalsConflict(goal1: string, goal2: string): boolean {
    // Simple heuristic: if goals share keywords, they might conflict
    const keywords1 = goal1.toLowerCase().split(/\s+/);
    const keywords2 = goal2.toLowerCase().split(/\s+/);
    
    const commonWords = ['find', 'get', 'obtain', 'protect', 'destroy', 'steal', 'save'];
    const hasCommonAction = commonWords.some(word => 
      keywords1.includes(word) && keywords2.includes(word)
    );
    
    return hasCommonAction;
  }
}

export const characterStrategyAnalyzer = new CharacterStrategyAnalyzer();
