import { describe, it, expect, vi, beforeEach } from 'vitest';
import { worldStateUpdater, type WorldStateUpdate } from '../agents/worldStateUpdater.js';
import { createWorldStateEngine, type WorldState } from '../world/worldStateEngine.js';
import type { StoryBible } from '../types/index.js';

describe('WorldStateUpdater - Four-Step Location Tracking', () => {
  const createTestBible = (): StoryBible => ({
    id: 'test-story',
    title: '测试故事',
    premise: '测试',
    genre: 'fantasy',
    setting: '长安城',
    tone: 'serious',
    targetChapters: 10,
    theme: '测试主题',
    language: 'zh-CN',
    characters: [
      { id: 'char-1', name: '张楚灵', role: 'protagonist', personality: ['勇敢'], goals: ['寻找真相'], background: '' }
    ],
    plotThreads: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const createTestWorldState = (): WorldState => {
    const engine = createWorldStateEngine('test-story');
    engine.addCharacter('张楚灵', '破窝棚', '疲惫');
    return engine.getState();
  };

  describe('Step 1: Segmented Extraction', () => {
    it('should split long content into segments', () => {
      const longContent = 'a'.repeat(10000);
      
      // Access private method through any type
      const segments = (worldStateUpdater as any).segmentContent(longContent);
      
      // Should have at least 3 segments: beginning, middle, end
      expect(segments.length).toBeGreaterThanOrEqual(3);
      
      // First segment should be marked as CHAPTER BEGINNING
      expect(segments[0]).toContain('[CHAPTER BEGINNING]');
      
      // Last segment should be marked as CHAPTER END
      expect(segments[segments.length - 1]).toContain('[CHAPTER END]');
    });

    it('should handle short content without excessive segmentation', () => {
      const shortContent = '这是一个短章节。';
      
      const segments = (worldStateUpdater as any).segmentContent(shortContent);
      
      // Should still have beginning and end markers
      expect(segments[0]).toContain('[CHAPTER BEGINNING]');
      expect(segments[segments.length - 1]).toContain('[CHAPTER END]');
    });
  });

  describe('Step 2: Enhanced Prompt', () => {
    it('should include location tracking instructions in prompt', () => {
      const stateContext = 'Test state';
      const segment = 'Test content';
      
      const prompt = (worldStateUpdater as any).buildEnhancedPrompt(
        stateContext,
        segment,
        false,
        false
      );
      
      // Should include critical location tracking instructions
      expect(prompt).toContain('CRITICAL LOCATION TRACKING INSTRUCTIONS');
      expect(prompt).toContain('Character Movements');
      expect(prompt).toContain('Scene Transitions');
    });

    it('should add special instructions for chapter beginning', () => {
      const prompt = (worldStateUpdater as any).buildEnhancedPrompt(
        'state',
        'content',
        true,  // isFirstSegment
        false
      );
      
      expect(prompt).toContain('CRITICAL - CHAPTER BEGINNING');
      expect(prompt).toContain('START this chapter');
    });

    it('should add special instructions for chapter ending', () => {
      const prompt = (worldStateUpdater as any).buildEnhancedPrompt(
        'state',
        'content',
        false,
        true  // isLastSegment
      );
      
      expect(prompt).toContain('CRITICAL - CHAPTER ENDING');
      expect(prompt).toContain('NEXT chapter');
    });
  });

  describe('Step 3: Beginning/End Special Handling', () => {
    it('should always include beginning segment', () => {
      const content = '第一章开头，张楚灵在破窝棚里醒来。' + 'a'.repeat(5000) + '最后，他走出窝棚。';
      
      const segments = (worldStateUpdater as any).segmentContent(content);
      
      // First segment should contain the beginning
      expect(segments[0]).toContain('张楚灵在破窝棚里醒来');
    });

    it('should always include ending segment', () => {
      const content = '开头。' + 'a'.repeat(5000) + '最后，张楚灵在龙王庙醒来。';
      
      const segments = (worldStateUpdater as any).segmentContent(content);
      
      // Last segment should contain the ending
      const lastSegment = segments[segments.length - 1];
      expect(lastSegment).toContain('张楚灵在龙王庙醒来');
    });
  });

  describe('Step 4: Location Continuity Validation', () => {
    it('should merge updates from multiple segments', () => {
      const updates1: WorldStateUpdate = {
        characterMoves: [{ character: '张楚灵', from: '破窝棚', to: '街上' }]
      };
      const updates2: WorldStateUpdate = {
        characterMoves: [{ character: '张楚灵', from: '街上', to: '龙王庙' }]
      };
      
      const merged = (worldStateUpdater as any).mergeUpdates([updates1, updates2]);
      
      // Should have both moves
      expect(merged.characterMoves).toHaveLength(2);
    });

    it('should remove duplicate moves for same character', () => {
      const updates1: WorldStateUpdate = {
        characterMoves: [{ character: '张楚灵', from: 'A', to: 'B' }]
      };
      const updates2: WorldStateUpdate = {
        characterMoves: [{ character: '张楚灵', from: 'A', to: 'B' }]
      };
      
      const merged = (worldStateUpdater as any).mergeUpdates([updates1, updates2]);
      
      // Should deduplicate
      expect(merged.characterMoves).toHaveLength(1);
    });

    it('should detect implied location from text', () => {
      const content = '张楚灵在龙王庙醒来，发现周围一片寂静。';
      
      const location = (worldStateUpdater as any).detectLocationFromText(
        content,
        '张楚灵'
      );
      
      expect(location).toBe('龙王庙');
    });

    it('should detect location with different patterns', () => {
      // Test with protagonist name in content
      const content1 = '张楚灵在城西的破庙里等待。';
      const location1 = (worldStateUpdater as any).detectLocationFromText(content1, '张楚灵');
      expect(location1).toBeTruthy();
      expect(location1).toContain('城西');
      
      const content2 = '张楚灵在长安城的街头漫步。';
      const location2 = (worldStateUpdater as any).detectLocationFromText(content2, '张楚灵');
      expect(location2).toBeTruthy();
      expect(location2).toContain('长安');
    });

    it('should add implied move when location detected but not recorded', () => {
      const currentState = createTestWorldState();
      const updates: WorldStateUpdate = {
        characterMoves: []
      };
      
      // Content shows character at different location
      const content = '...张楚灵在龙王庙醒来...';
      
      const validated = (worldStateUpdater as any).validateAndFixLocationContinuity(
        updates,
        currentState,
        content
      );
      
      // Should add the implied move
      expect(validated.characterMoves?.length).toBeGreaterThan(0);
      const move = validated.characterMoves?.[0];
      expect(move?.character).toBe('张楚灵');
      expect(move?.from).toBe('破窝棚');
      expect(move?.to).toBe('龙王庙');
    });
  });

  describe('Integration: Full Update Flow', () => {
    it('should handle location change in chapter content', async () => {
      const bible = createTestBible();
      const currentState = createTestWorldState();
      
      // Mock LLM response
      const mockLLM = {
        complete: vi.fn().mockResolvedValue(JSON.stringify({
          characterMoves: [{ character: '张楚灵', from: '破窝棚', to: '龙王庙' }]
        }))
      };
      
      // Replace getLLM temporarily
      const originalModule = await import('../llm/client.js');
      const originalGetLLM = originalModule.getLLM;
      vi.spyOn(originalModule, 'getLLM').mockReturnValue(mockLLM as any);
      
      const content = `
        张楚灵在破窝棚里昏昏睡去。
        第二天清晨，他在龙王庙的稻草堆上醒来。
        阳光透过破败的屋顶洒下来。
      `;
      
      try {
        const updates = await worldStateUpdater.extractUpdates({
          content,
          bible,
          currentState,
          chapterNumber: 2
        });
        
        expect(updates.characterMoves).toBeDefined();
        expect(updates.characterMoves?.length).toBeGreaterThan(0);
      } finally {
        // Restore original
        vi.restoreAllMocks();
      }
    });
  });
});
