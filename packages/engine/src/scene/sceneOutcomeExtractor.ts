import { getLLM } from '../llm/client.js';
import type { Scene, SceneOutput, SceneOutcome, StoryBible } from '../types/index.js';

interface OutcomeExtractorInput {
  scene: Scene;
  sceneOutput: SceneOutput;
  bible: StoryBible;
}

/**
 * SceneOutcomeExtractor extracts state changes from a scene
 * This is used to update world state after each scene
 */
export async function extractSceneOutcome(input: OutcomeExtractorInput): Promise<SceneOutcome> {
  const { scene, sceneOutput, bible } = input;
  
  const llm = getLLM();
  
  const prompt = `Extract the outcomes from this scene. What changed?

## Scene Information
Location: ${scene.location || 'Not specified'}
Characters: ${scene.characters?.join(', ') || 'Not specified'}
Purpose: ${scene.purpose}

## Scene Content
${sceneOutput.content}

## Extraction Task
Identify:
1. Key events that occurred
2. Character changes (emotional, knowledge, status)
3. Location changes (who is where now)
4. New information revealed

Return a JSON object:
{
  "events": ["event 1", "event 2"],
  "characterChanges": {
    "CharacterName": "what changed for them"
  },
  "locationChanges": {
    "LocationName": "who is now there"
  },
  "newInformation": ["fact 1 revealed", "fact 2 revealed"]
}

Return ONLY the JSON object.`;

  try {
    const response = await llm.complete(prompt, { 
      temperature: 0.4,
      maxTokens: 1500 
    });
    
    // Clean up response and parse JSON
    const cleaned = response.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
    const outcome: SceneOutcome = JSON.parse(cleaned);
    
    return outcome;
  } catch (error) {
    console.error('Outcome extraction failed:', error);
    
    // Fallback: create basic outcome
    return createFallbackOutcome(scene, sceneOutput);
  }
}

function createFallbackOutcome(scene: Scene, sceneOutput: SceneOutput): SceneOutcome {
  return {
    events: [`Scene completed in ${scene.location}`],
    characterChanges: {},
    locationChanges: {},
    newInformation: []
  };
}

/**
 * Merge multiple scene outcomes into a single chapter outcome
 */
export function mergeSceneOutcomes(outcomes: SceneOutcome[]): SceneOutcome {
  const merged: SceneOutcome = {
    events: [],
    characterChanges: {},
    locationChanges: {},
    newInformation: []
  };
  
  for (const outcome of outcomes) {
    // Merge events
    if (outcome.events) {
      merged.events.push(...outcome.events);
    }
    
    // Merge character changes
    if (outcome.characterChanges) {
      Object.assign(merged.characterChanges, outcome.characterChanges);
    }
    
    // Merge location changes
    if (outcome.locationChanges) {
      Object.assign(merged.locationChanges, outcome.locationChanges);
    }
    
    // Merge new information
    if (outcome.newInformation) {
      merged.newInformation.push(...outcome.newInformation);
    }
  }
  
  // Remove duplicates from arrays
  merged.events = [...new Set(merged.events)];
  merged.newInformation = [...new Set(merged.newInformation)];
  
  return merged;
}
