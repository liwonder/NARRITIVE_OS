import type { Chapter, StoryBible, StoryState } from '../types/index.js';
import type { StoryStructuredState } from '../story/structuredState.js';

export interface TensionAnalysis {
  currentTension: number;
  targetTension: number;
  tensionGap: number; // positive = need to increase, negative = need to decrease
  recommendedAction: 'escalate' | 'maintain' | 'resolve' | 'climax';
  reasoning: string;
}

export interface TensionGuidance {
  targetTension: number;
  guidance: string;
  sceneTypes: string[];
  pacingNotes: string;
}

/**
 * Calculate target tension using parabolic curve
 * Formula: targetTension = 4 * progress * (1 - progress)
 * 
 * This creates a natural dramatic arc:
 * - Chapter 0: 0% tension (setup)
 * - Middle chapters: ~100% tension (peak drama)
 * - Final chapter: 0% tension (resolution)
 */
export function calculateTargetTension(
  currentChapter: number,
  totalChapters: number
): number {
  if (totalChapters <= 1) return 0.5;
  
  // Progress from 0 to 1
  const progress = (currentChapter - 1) / (totalChapters - 1);
  
  // Parabolic curve: 4 * x * (1 - x)
  // Peak at 0.5 (middle of story)
  const targetTension = 4 * progress * (1 - progress);
  
  // Round to 2 decimal places
  return Math.round(targetTension * 100) / 100;
}

/**
 * Calculate tension for next chapter based on ideal arc
 */
export function calculateNextChapterTension(
  currentChapter: number,
  totalChapters: number
): number {
  return calculateTargetTension(currentChapter + 1, totalChapters);
}

/**
 * Analyze current tension vs target and provide guidance
 */
export function analyzeTension(
  storyState: StoryState,
  structuredState: StoryStructuredState
): TensionAnalysis {
  const targetTension = calculateTargetTension(
    storyState.currentChapter,
    storyState.totalChapters
  );
  
  const currentTension = structuredState.tension;
  const tensionGap = targetTension - currentTension;
  
  let recommendedAction: TensionAnalysis['recommendedAction'];
  let reasoning: string;
  
  if (storyState.currentChapter === storyState.totalChapters) {
    recommendedAction = 'resolve';
    reasoning = 'Final chapter - bring tensions to resolution';
  } else if (tensionGap > 0.2) {
    recommendedAction = 'escalate';
    reasoning = `Tension is ${(tensionGap * 100).toFixed(0)}% below target. Escalate conflict.`;
  } else if (tensionGap < -0.15) {
    recommendedAction = 'maintain';
    reasoning = `Tension is ${(Math.abs(tensionGap) * 100).toFixed(0)}% above target. Allow breathing room.`;
  } else if (targetTension > 0.85) {
    recommendedAction = 'climax';
    reasoning = 'Near peak tension - build toward climax';
  } else {
    recommendedAction = 'maintain';
    reasoning = 'Tension is on track with target arc';
  }
  
  return {
    currentTension,
    targetTension,
    tensionGap,
    recommendedAction,
    reasoning,
  };
}

/**
 * Generate tension guidance for the writer
 */
export function generateTensionGuidance(
  analysis: TensionAnalysis,
  storyState: StoryState
): TensionGuidance {
  const { targetTension, recommendedAction } = analysis;
  
  let guidance: string;
  let sceneTypes: string[];
  let pacingNotes: string;
  
  switch (recommendedAction) {
    case 'escalate':
      guidance = 'Increase dramatic tension. Introduce complications, raise stakes, or deepen conflicts.';
      sceneTypes = ['confrontation', 'discovery', 'setback', 'danger'];
      pacingNotes = 'Faster pace, shorter scenes, more action/dialogue';
      break;
      
    case 'maintain':
      guidance = 'Maintain current tension level. Balance action with character moments.';
      sceneTypes = ['development', 'interaction', 'preparation', 'reflection'];
      pacingNotes = 'Moderate pace, mix of action and quiet moments';
      break;
      
    case 'resolve':
      guidance = 'Begin resolving tensions. Answer questions, conclude arcs, provide closure.';
      sceneTypes = ['resolution', 'revelation', 'farewell', 'new beginning'];
      pacingNotes = 'Slower pace, focus on emotional satisfaction';
      break;
      
    case 'climax':
      guidance = 'Build toward peak tension. Maximum stakes, critical decisions, turning points.';
      sceneTypes = ['climax', 'showdown', 'revelation', 'sacrifice'];
      pacingNotes = 'Fastest pace, continuous escalation, no relief';
      break;
      
    default:
      guidance = 'Follow the natural flow of the story.';
      sceneTypes = ['mixed'];
      pacingNotes = 'Balanced pacing';
  }
  
  return {
    targetTension,
    guidance,
    sceneTypes,
    pacingNotes,
  };
}

/**
 * Format tension guidance for writer prompt
 */
export function formatTensionForPrompt(guidance: TensionGuidance): string {
  const tensionPercent = Math.round(guidance.targetTension * 100);
  
  return `## Tension Guidance

**Target Tension Level:** ${tensionPercent}%

**Guidance:** ${guidance.guidance}

**Recommended Scene Types:** ${guidance.sceneTypes.join(', ')}

**Pacing Notes:** ${guidance.pacingNotes}
`;
}

/**
 * Calculate tension based on chapter content analysis
 * This is a heuristic for estimating tension from text
 */
export function estimateTensionFromChapter(chapter: Chapter): number {
  const content = chapter.content.toLowerCase();
  
  // Tension indicators
  const tensionWords = [
    'fear', 'danger', 'threat', 'attack', 'fight', 'battle',
    'scream', 'cry', 'panic', 'terror', 'horror',
    'chase', 'escape', 'hide', 'run', 'flee',
    'discover', 'reveal', 'secret', 'mystery', 'truth',
    'confront', 'accuse', 'blame', 'angry', 'furious',
    'worry', 'anxious', 'nervous', 'tense', 'stress',
    'urgent', 'emergency', 'crisis', 'critical', 'desperate',
  ];
  
  const calmWords = [
    'peace', 'calm', 'quiet', 'relax', 'rest',
    'happy', 'joy', 'laugh', 'smile', 'comfort',
    'safe', 'secure', 'peaceful', 'tranquil', 'serene',
  ];
  
  let tensionScore = 0.5; // baseline
  
  // Count tension indicators
  for (const word of tensionWords) {
    const count = (content.match(new RegExp(word, 'g')) || []).length;
    tensionScore += count * 0.02;
  }
  
  // Subtract calm indicators
  for (const word of calmWords) {
    const count = (content.match(new RegExp(word, 'g')) || []).length;
    tensionScore -= count * 0.015;
  }
  
  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, Math.round(tensionScore * 100) / 100));
}

/**
 * TensionController class for managing story tension
 */
export class TensionController {
  /**
   * Analyze current story state and provide tension guidance
   */
  analyze(
    storyState: StoryState,
    structuredState: StoryStructuredState
  ): TensionAnalysis {
    return analyzeTension(storyState, structuredState);
  }
  
  /**
   * Generate guidance for the next chapter
   */
  generateGuidance(
    storyState: StoryState,
    structuredState: StoryStructuredState
  ): TensionGuidance {
    const analysis = this.analyze(storyState, structuredState);
    return generateTensionGuidance(analysis, storyState);
  }
  
  /**
   * Calculate what the tension should be for a specific chapter
   */
  calculateTarget(chapterNumber: number, totalChapters: number): number {
    return calculateTargetTension(chapterNumber, totalChapters);
  }
  
  /**
   * Estimate tension from chapter content
   */
  estimateFromContent(chapter: Chapter): number {
    return estimateTensionFromChapter(chapter);
  }
}

export const tensionController = new TensionController();
