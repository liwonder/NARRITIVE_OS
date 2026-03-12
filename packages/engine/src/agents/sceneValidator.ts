import { getLLM } from '../llm/client.js';
import type { Scene, SceneOutput, SceneValidationResult, StoryBible } from '../types/index.js';

interface SceneValidatorInput {
  scene: Scene;
  sceneOutput: SceneOutput;
  bible: StoryBible;
  canonFacts?: string[];
}

/**
 * SceneValidator checks if a generated scene meets quality and consistency standards
 */
export async function validateScene(input: SceneValidatorInput): Promise<SceneValidationResult> {
  const { scene, sceneOutput, bible, canonFacts = [] } = input;
  
  const llm = getLLM();
  
  const prompt = `You are a quality control editor. Validate this scene against the requirements.

## Scene Requirements
Location: ${scene.location}
Characters Required: ${scene.characters.join(', ')}
Scene Purpose: ${scene.purpose}
Target Tension: ${scene.tension}/10

## Generated Scene
${sceneOutput.content}

${canonFacts.length > 0 ? `## Canon Facts (Must Not Violate)\n${canonFacts.map(f => `- ${f}`).join('\n')}\n` : ''}

## Validation Criteria
1. Are all required characters present?
2. Does the scene take place in the correct location?
3. Does it fulfill its stated purpose?
4. Is the tension level appropriate?
5. Are there any canon violations?
6. Is the writing quality acceptable?

Return a JSON object:
{
  "isValid": true/false,
  "violations": ["list any issues found, or empty array if valid"]
}

Return ONLY the JSON object.`;

  try {
    const response = await llm.complete(prompt, { 
      temperature: 0.3,
      maxTokens: 1000 
    });
    
    // Clean up response and parse JSON
    const cleaned = response.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
    const result: SceneValidationResult = JSON.parse(cleaned);
    
    return result;
  } catch (error) {
    console.error('Scene validation failed:', error);
    
    // Fallback: basic validation
    return performBasicValidation(scene, sceneOutput, bible);
  }
}

function performBasicValidation(
  scene: Scene, 
  sceneOutput: SceneOutput, 
  bible: StoryBible
): SceneValidationResult {
  const violations: string[] = [];
  
  // Check content length
  if (sceneOutput.wordCount < 50) {
    violations.push('Scene is too short');
  }
  
  // Check if characters are mentioned
  const contentLower = sceneOutput.content.toLowerCase();
  for (const charName of scene.characters) {
    if (!contentLower.includes(charName.toLowerCase())) {
      violations.push(`Character "${charName}" not found in scene`);
    }
  }
  
  // Check if location is mentioned
  if (!contentLower.includes(scene.location.toLowerCase())) {
    violations.push(`Location "${scene.location}" not found in scene`);
  }
  
  return {
    isValid: violations.length === 0,
    violations
  };
}

/**
 * Quick validation without LLM - for performance-critical paths
 */
export function quickValidateScene(scene: Scene, sceneOutput: SceneOutput): SceneValidationResult {
  const violations: string[] = [];
  
  if (!sceneOutput.content || sceneOutput.content.length < 100) {
    violations.push('Scene content too short');
  }
  
  if (sceneOutput.wordCount < 30) {
    violations.push('Word count too low');
  }
  
  return {
    isValid: violations.length === 0,
    violations
  };
}
