import { describe, it, expect } from 'vitest';
import {
  calculateTargetTension,
  calculateNextChapterTension,
  analyzeTension,
  generateTensionGuidance,
  formatTensionForPrompt,
  estimateTensionFromChapter,
  tensionController,
  createStoryState,
  createStructuredState,
} from '../index.js';

describe('Narrative Tension Controller (Phase 5)', () => {
  it('should calculate target tension for story arc', () => {
    // 10-chapter story tension curve
    const tensions = [];
    for (let i = 1; i <= 10; i++) {
      tensions.push(calculateTargetTension(i, 10));
    }
    
    // Should follow parabolic arc: low → high → low
    expect(tensions[0]).toBeLessThan(tensions[4]); // Ch 1 < Ch 5
    expect(tensions[4]).toBeGreaterThan(tensions[9]); // Ch 5 > Ch 10
    expect(tensions[4]).toBeGreaterThan(0.5); // Middle should be high tension
  });

  it('should calculate next chapter tension', () => {
    const nextTension = calculateNextChapterTension(3, 10);
    expect(nextTension).toBeGreaterThan(0);
    expect(nextTension).toBeLessThanOrEqual(1);
  });

  it('should analyze tension and recommend escalation when too low', () => {
    const storyState = createStoryState('test-story', 10);
    storyState.currentChapter = 5;
    
    const lowTensionState = createStructuredState('test-story');
    lowTensionState.tension = 0.3; // Too low for middle chapter

    const analysis = analyzeTension(storyState, lowTensionState);
    
    expect(analysis.currentTension).toBe(0.3);
    expect(analysis.tensionGap).toBeGreaterThan(0);
    expect(analysis.recommendedAction).toBe('escalate');
  });

  it('should analyze tension and recommend maintenance when appropriate', () => {
    const storyState = createStoryState('test-story', 10);
    storyState.currentChapter = 5;
    
    const goodTensionState = createStructuredState('test-story');
    goodTensionState.tension = 0.95; // Good for middle chapter

    const analysis = analyzeTension(storyState, goodTensionState);
    
    expect(['maintain', 'climax', 'escalate', 'resolve']).toContain(analysis.recommendedAction);
  });

  it('should recommend resolution for final chapter', () => {
    const storyState = createStoryState('test-story', 10);
    storyState.currentChapter = 10;
    
    const highTensionState = createStructuredState('test-story');
    highTensionState.tension = 0.9;

    const analysis = analyzeTension(storyState, highTensionState);
    
    expect(analysis.recommendedAction).toBe('resolve');
  });

  it('should generate tension guidance', () => {
    const storyState = createStoryState('test-story', 10);
    storyState.currentChapter = 5;
    
    const lowTensionState = createStructuredState('test-story');
    lowTensionState.tension = 0.3;
    
    const analysis = analyzeTension(storyState, lowTensionState);
    const guidance = generateTensionGuidance(analysis, storyState);
    
    expect(guidance.targetTension).toBeGreaterThan(0);
    expect(guidance.guidance).toBeTruthy();
    expect(guidance.sceneTypes).toBeInstanceOf(Array);
    expect(guidance.pacingNotes).toBeTruthy();
  });

  it('should format tension for prompt', () => {
    const storyState = createStoryState('test-story', 10);
    storyState.currentChapter = 5;
    
    const lowTensionState = createStructuredState('test-story');
    lowTensionState.tension = 0.3;
    
    const analysis = analyzeTension(storyState, lowTensionState);
    const guidance = generateTensionGuidance(analysis, storyState);
    const formatted = formatTensionForPrompt(guidance);
    
    expect(formatted).toContain('Tension');
    expect(formatted).toContain('Guidance');
  });

  it('should estimate tension from chapter content', () => {
    const highTensionChapter = {
      id: 'test-1',
      storyId: 'test',
      number: 1,
      title: 'The Chase',
      content: `The darkness closed in around them. Sarah could hear footsteps behind her, getting closer. Her heart pounded in her chest as she ran through the narrow alley. Fear gripped her throat. She had to escape, had to hide. The danger was real, the threat imminent.`,
      wordCount: 80,
      summary: 'Sarah is chased through dark alleys',
      generatedAt: new Date(),
    };

    const lowTensionChapter = {
      id: 'test-2',
      storyId: 'test',
      number: 2,
      title: 'Peaceful Morning',
      content: `The sun rose over the quiet village. Birds sang in the trees, and a gentle breeze carried the scent of flowers. Sarah sat on her porch, sipping tea and watching the peaceful scene. She felt calm and happy, safe in her home.`,
      wordCount: 60,
      summary: 'Sarah enjoys a peaceful morning',
      generatedAt: new Date(),
    };

    const highEstimate = estimateTensionFromChapter(highTensionChapter);
    const lowEstimate = estimateTensionFromChapter(lowTensionChapter);

    expect(highEstimate).toBeGreaterThan(lowEstimate);
    expect(highEstimate).toBeGreaterThan(0.5);
    expect(lowEstimate).toBeLessThan(0.5);
  });

  it('should work with TensionController class', () => {
    const controller = tensionController;
    const storyState = createStoryState('test-story', 10);
    storyState.currentChapter = 5;
    
    const lowTensionState = createStructuredState('test-story');
    lowTensionState.tension = 0.3;

    const analysis = controller.analyze(storyState, lowTensionState);
    const guidance = controller.generateGuidance(storyState, lowTensionState);
    const target = controller.calculateTarget(5, 10);

    expect(analysis.recommendedAction).toBe('escalate');
    expect(guidance.targetTension).toBeGreaterThan(0);
    expect(target).toBeGreaterThan(0);
  });
});
