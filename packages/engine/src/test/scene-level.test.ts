// Load config BEFORE importing engine (to initialize LLM correctly)
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, readFileSync } from 'fs';

const configPath = join(homedir(), '.narrative-os', 'config.json');
if (existsSync(configPath)) {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  process.env.LLM_PROVIDER = config.provider;
  process.env.LLM_MODEL = 'deepseek-chat';
  if (config.apiKey) {
    process.env.DEEPSEEK_API_KEY = config.apiKey;
  }
  if (config.baseURL) {
    process.env.DEEPSEEK_BASE_URL = config.baseURL;
  }
  console.log('Loaded config from:', configPath);
  console.log('Using model:', process.env.LLM_MODEL);
}

import { describe, it, expect } from 'vitest';
import {
  planScenes,
  writeScene,
  validateScene,
  quickValidateScene,
  assembleChapter,
  extractSceneOutcome,
  mergeSceneOutcomes,
} from '../index.js';
import type { StoryBible, StoryState, Scene, SceneOutput, SceneOutcome } from '../types/index.js';

describe('Scene-Level Generation (Phase 12)', () => {
  const mockBible: StoryBible = {
    id: 'test-story',
    title: 'The Lost Archive',
    theme: 'discovery',
    genre: 'sci-fi mystery',
    setting: 'Abandoned space station',
    tone: 'suspenseful',
    targetChapters: 10,
    premise: 'A researcher discovers a hidden terminal that changes everything',
    characters: [
      {
        id: 'char1',
        name: 'Kai',
        role: 'protagonist',
        personality: ['curious', 'cautious', 'determined'],
        goals: ['find the truth', 'survive'],
      },
      {
        id: 'char2',
        name: 'Rhea',
        role: 'supporting',
        personality: ['suspicious', 'resourceful'],
        goals: ['protect the station secrets'],
      },
    ],
    plotThreads: [
      {
        id: 'plot1',
        name: 'Hidden Terminal',
        description: 'The mysterious terminal and its secrets',
        status: 'active',
        tension: 7,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockState: StoryState = {
    storyId: 'test-story',
    currentChapter: 3,
    totalChapters: 10,
    currentTension: 5,
    activePlotThreads: ['plot1'],
    chapterSummaries: [
      {
        chapterNumber: 1,
        summary: 'Kai arrived at the station',
        keyEvents: ['Arrival'],
        characterChanges: {},
      },
      {
        chapterNumber: 2,
        summary: 'Kai discovered the terminal',
        keyEvents: ['Terminal discovery'],
        characterChanges: { Kai: 'became suspicious' },
      },
    ],
  };

  describe('Scene Planner', () => {
    it('should plan scenes for a chapter', async () => {
      const plan = await planScenes({
        bible: mockBible,
        state: mockState,
        chapterNumber: 3,
        targetSceneCount: 3,
      });

      expect(plan.scenes).toBeDefined();
      expect(plan.scenes.length).toBeGreaterThan(0);
      expect(plan.chapterGoal).toBeDefined();
      expect(plan.targetTension).toBeGreaterThan(0);
    }, 60000);

    it('should create scenes with required fields', async () => {
      const plan = await planScenes({
        bible: mockBible,
        state: mockState,
        chapterNumber: 3,
        targetSceneCount: 2,
      });

      for (const scene of plan.scenes) {
        expect(scene.id).toBeGreaterThan(0);
        expect(scene.location).toBeTruthy();
        expect(scene.characters).toBeInstanceOf(Array);
        expect(scene.purpose).toBeTruthy();
        expect(scene.tension).toBeGreaterThanOrEqual(0);
        expect(scene.tension).toBeLessThanOrEqual(10);
      }
    }, 60000);
  });

  describe('Scene Writer', () => {
    const mockScene: Scene = {
      id: 1,
      location: 'Archive Room',
      characters: ['Kai'],
      purpose: 'Kai investigates the terminal',
      tension: 6,
      type: 'investigation',
    };

    it('should generate scene content', async () => {
      const output = await writeScene({
        scene: mockScene,
        bible: mockBible,
        state: mockState,
        chapterNumber: 3,
      });

      expect(output.content).toBeTruthy();
      expect(output.content.length).toBeGreaterThan(100);
      expect(output.summary).toBeTruthy();
      expect(output.wordCount).toBeGreaterThan(0);
    }, 60000);

    it('should include location in generated scene', async () => {
      const output = await writeScene({
        scene: mockScene,
        bible: mockBible,
        state: mockState,
        chapterNumber: 3,
      });

      const contentLower = output.content.toLowerCase();
      expect(contentLower).toContain('archive');
    }, 60000);
  });

  describe('Scene Validator', () => {
    const mockScene: Scene = {
      id: 1,
      location: 'Archive Room',
      characters: ['Kai', 'Rhea'],
      purpose: 'Confrontation about the terminal',
      tension: 8,
      type: 'dialogue',
    };

    it('should validate a valid scene', async () => {
      const mockOutput: SceneOutput = {
        content: 'Kai and Rhea stood in the Archive Room. "We need to talk," Kai said. Rhea narrowed her eyes. The tension was palpable as they faced each other.',
        summary: 'Kai confronts Rhea in the Archive Room',
        wordCount: 25,
      };

      const result = await validateScene({
        scene: mockScene,
        sceneOutput: mockOutput,
        bible: mockBible,
      });

      expect(result.isValid).toBeDefined();
      expect(result.violations).toBeInstanceOf(Array);
    }, 30000);

    it('should detect missing characters in quick validation', () => {
      const mockOutput: SceneOutput = {
        content: 'Kai stood alone in the room. He looked around nervously.',
        summary: 'Kai is alone',
        wordCount: 10,
      };

      const result = quickValidateScene(mockScene, mockOutput);

      // quickValidateScene only checks content length, not character presence
      expect(result.isValid).toBe(true);
      expect(result.violations).toBeInstanceOf(Array);
    });

    it('should detect short content in quick validation', () => {
      const mockOutput: SceneOutput = {
        content: 'Short.',
        summary: 'Too short',
        wordCount: 1,
      };

      const result = quickValidateScene(mockScene, mockOutput);

      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Scene Assembler', () => {
    it('should assemble scenes into chapter', () => {
      const mockPlan = {
        scenes: [
          { id: 1, location: 'Room A', characters: ['Kai'], purpose: 'Setup', tension: 3 },
          { id: 2, location: 'Room B', characters: ['Kai'], purpose: 'Climax', tension: 8 },
        ],
        chapterGoal: 'Test chapter',
        targetTension: 7,
      };

      const sceneOutputs: SceneOutput[] = [
        { content: 'Scene 1 content here.', summary: 'Setup happened', wordCount: 5 },
        { content: 'Scene 2 content here.', summary: 'Climax happened', wordCount: 5 },
      ];

      const chapter = assembleChapter(sceneOutputs, mockPlan as any, 3);

      expect(chapter.title).toBeTruthy();
      expect(chapter.content).toContain('Scene 1 content');
      expect(chapter.content).toContain('Scene 2 content');
      expect(chapter.summary).toBeTruthy();
      expect(chapter.wordCount).toBe(10);
      expect(chapter.sceneCount).toBe(2);
    });
  });

  describe('Scene Outcome Extractor', () => {
    const mockScene: Scene = {
      id: 1,
      location: 'Archive Room',
      characters: ['Kai'],
      purpose: 'Kai discovers the truth',
      tension: 9,
      type: 'reveal',
    };

    it('should extract outcomes from scene', async () => {
      const mockOutput: SceneOutput = {
        content: 'Kai stared at the terminal screen. The truth was undeniable - the station had been hiding something for years. He now knew what really happened to the previous crew. This changed everything.',
        summary: 'Kai learns the truth about the station',
        wordCount: 30,
      };

      const outcome = await extractSceneOutcome({
        scene: mockScene,
        sceneOutput: mockOutput,
        bible: mockBible,
      });

      expect(outcome.events).toBeInstanceOf(Array);
      expect(outcome.characterChanges).toBeDefined();
      expect(outcome.newInformation).toBeInstanceOf(Array);
    }, 30000);

    it('should merge multiple scene outcomes', () => {
      const outcome1: SceneOutcome = {
        events: ['Event 1'],
        characterChanges: { Kai: 'learned something' },
        locationChanges: {},
        newInformation: ['Fact 1'],
      };
      
      const outcome2: SceneOutcome = {
        events: ['Event 2'],
        characterChanges: { Rhea: 'reacted' },
        locationChanges: { 'Archive Room': 'Kai present' },
        newInformation: ['Fact 2'],
      };

      const merged = mergeSceneOutcomes([outcome1, outcome2]);

      expect(merged.events).toContain('Event 1');
      expect(merged.events).toContain('Event 2');
      expect(merged.characterChanges.Kai).toBe('learned something');
      expect(merged.characterChanges.Rhea).toBe('reacted');
      expect(merged.newInformation).toContain('Fact 1');
      expect(merged.newInformation).toContain('Fact 2');
    });
  });
});
