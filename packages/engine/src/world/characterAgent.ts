import { getLLM } from '../llm/client.js';
import type { CharacterState } from '../story/structuredState.js';

export interface CharacterAgent {
  name: string;
  goals: string[];
  currentGoal: string;
  location: string;
  knowledge: string[];
  relationships: Record<string, string>;
  personality: string[];
  emotionalState: string;
  inventory: string[];
  agenda: AgendaItem[];
}

export interface AgendaItem {
  id: string;
  action: string;
  priority: number;
  deadline?: number; // chapter number
  completed: boolean;
}

export interface CharacterDecision {
  character: string;
  action: string;
  target?: string;
  reasoning: string;
  consequences: string[];
}

export interface CharacterAgentContext {
  character: CharacterAgent;
  otherCharacters: CharacterAgent[];
  worldEvents: string[];
  currentChapter: number;
  storyContext: string;
}

const CHARACTER_DECISION_PROMPT = `You are simulating a character in a narrative. Decide what this character would do next based on their personality, goals, and current situation.

## Character

**Name:** {{name}}
**Personality:** {{personality}}
**Current Emotional State:** {{emotionalState}}
**Location:** {{location}}

### Goals
{{goals}}

### Current Agenda
{{agenda}}

### Knowledge
{{knowledge}}

### Relationships
{{relationships}}

## Current Situation

**Chapter:** {{chapter}}
**Story Context:** {{storyContext}}

### Other Characters Present
{{otherCharacters}}

### Recent World Events
{{worldEvents}}

## Your Task

Decide what {{name}} would do next. Consider:
1. Their personality and emotional state
2. Their current goals and agenda
3. Their relationships with others
4. Recent events that might affect their decision
5. What would create interesting dramatic possibilities

Output JSON:
{
  "character": "{{name}}",
  "action": "What they decide to do (be specific and actionable)",
  "target": "Who or what they act toward (if anyone)",
  "reasoning": "Why they make this decision based on their character",
  "consequences": ["Possible outcomes or reactions from this action"]
}`;

export class CharacterAgentSystem {
  /**
   * Create a character agent from structured state
   */
  createAgent(characterState: CharacterState, personality: string[]): CharacterAgent {
    return {
      name: characterState.name,
      goals: [...characterState.goals],
      currentGoal: characterState.goals[0] || 'unknown',
      location: characterState.location,
      knowledge: [...characterState.knowledge],
      relationships: { ...characterState.relationships },
      personality: [...personality],
      emotionalState: characterState.emotionalState,
      inventory: [],
      agenda: [],
    };
  }
  
  /**
   * Add an agenda item for a character
   */
  addAgendaItem(
    agent: CharacterAgent,
    action: string,
    priority: number = 5,
    deadline?: number
  ): CharacterAgent {
    return {
      ...agent,
      agenda: [
        ...agent.agenda,
        {
          id: `agenda-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          action,
          priority,
          deadline,
          completed: false,
        },
      ],
    };
  }
  
  /**
   * Complete an agenda item
   */
  completeAgendaItem(agent: CharacterAgent, agendaId: string): CharacterAgent {
    return {
      ...agent,
      agenda: agent.agenda.map(item =>
        item.id === agendaId ? { ...item, completed: true } : item
      ),
    };
  }
  
  /**
   * Update character knowledge
   */
  addKnowledge(agent: CharacterAgent, fact: string): CharacterAgent {
    if (agent.knowledge.includes(fact)) return agent;
    return {
      ...agent,
      knowledge: [...agent.knowledge, fact],
    };
  }
  
  /**
   * Update relationship
   */
  updateRelationship(
    agent: CharacterAgent,
    otherCharacter: string,
    relationship: string
  ): CharacterAgent {
    return {
      ...agent,
      relationships: {
        ...agent.relationships,
        [otherCharacter]: relationship,
      },
    };
  }
  
  /**
   * Move character to new location
   */
  moveTo(agent: CharacterAgent, location: string): CharacterAgent {
    return {
      ...agent,
      location,
    };
  }
  
  /**
   * Get character decision using LLM
   */
  async getDecision(context: CharacterAgentContext): Promise<CharacterDecision> {
    const { character, otherCharacters, worldEvents, currentChapter, storyContext } = context;
    
    const prompt = CHARACTER_DECISION_PROMPT
      .replace(/{{name}}/g, character.name)
      .replace('{{personality}}', character.personality.join(', '))
      .replace('{{emotionalState}}', character.emotionalState)
      .replace('{{location}}', character.location)
      .replace('{{goals}}', character.goals.map(g => `- ${g}`).join('\n'))
      .replace('{{agenda}}', character.agenda.filter(a => !a.completed).map(a => `- ${a.action} (priority: ${a.priority})`).join('\n') || 'No active agenda')
      .replace('{{knowledge}}', character.knowledge.map(k => `- ${k}`).join('\n') || 'No special knowledge')
      .replace('{{relationships}}', Object.entries(character.relationships).map(([name, rel]) => `- ${name}: ${rel}`).join('\n') || 'No significant relationships')
      .replace('{{chapter}}', currentChapter.toString())
      .replace('{{storyContext}}', storyContext)
      .replace('{{otherCharacters}}', otherCharacters.map(c => `- ${c.name} (${c.emotionalState}, at ${c.location})`).join('\n') || 'No other characters present')
      .replace('{{worldEvents}}', worldEvents.map(e => `- ${e}`).join('\n') || 'No recent events');
    
    const result = await getLLM().completeJSON<CharacterDecision>(prompt, {
      temperature: 0.5,
      maxTokens: 1000,
    });
    
    return result;
  }
  
  /**
   * Get simple decision without LLM (for testing/fallback)
   */
  getSimpleDecision(context: CharacterAgentContext): CharacterDecision {
    const { character, otherCharacters } = context;
    
    // Find incomplete agenda items
    const activeAgenda = character.agenda.filter(a => !a.completed);
    
    if (activeAgenda.length > 0) {
      // Follow highest priority agenda item
      const topPriority = activeAgenda.sort((a, b) => b.priority - a.priority)[0];
      return {
        character: character.name,
        action: topPriority.action,
        reasoning: `Following their agenda: ${topPriority.action}`,
        consequences: ['Progress toward goal'],
      };
    }
    
    // React to other characters if present
    if (otherCharacters.length > 0) {
      const other = otherCharacters[0];
      const relationship = character.relationships[other.name] || 'neutral';
      
      if (relationship.includes('friend') || relationship.includes('ally')) {
        return {
          character: character.name,
          action: `Approach ${other.name} to talk`,
          target: other.name,
          reasoning: `They are ${relationship} and nearby`,
          consequences: ['Social interaction', 'Information exchange'],
        };
      }
      
      if (relationship.includes('enemy') || relationship.includes('hostile')) {
        return {
          character: character.name,
          action: `Keep distance from ${other.name}`,
          target: other.name,
          reasoning: `They are ${relationship}`,
          consequences: ['Avoiding conflict', 'Maintaining safety'],
        };
      }
    }
    
    // Default: pursue current goal
    return {
      character: character.name,
      action: `Work toward goal: ${character.currentGoal}`,
      reasoning: 'No immediate distractions, focusing on primary objective',
      consequences: ['Progress toward goal', 'Possible new opportunities'],
    };
  }
  
  /**
   * Simulate multiple characters making decisions
   */
  async simulateTurn(
    agents: CharacterAgent[],
    worldEvents: string[],
    currentChapter: number,
    storyContext: string,
    useLLM: boolean = false
  ): Promise<CharacterDecision[]> {
    const decisions: CharacterDecision[] = [];
    
    for (const agent of agents) {
      const context: CharacterAgentContext = {
        character: agent,
        otherCharacters: agents.filter(a => a.name !== agent.name),
        worldEvents,
        currentChapter,
        storyContext,
      };
      
      try {
        const decision = useLLM
          ? await this.getDecision(context)
          : this.getSimpleDecision(context);
        decisions.push(decision);
      } catch (error) {
        // Fallback to simple decision on error
        decisions.push(this.getSimpleDecision(context));
      }
    }
    
    return decisions;
  }
}

export const characterAgentSystem = new CharacterAgentSystem();
