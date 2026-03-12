#!/usr/bin/env tsx
/**
 * Full workflow integration test
 * Tests: init -> generate chapter 1 -> verify output
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TEST_STORY_TITLE = 'Test Mystery Story';
const TEST_DIR = path.join(os.homedir(), '.narrative-os');

// Use local CLI (built from source)
const CLI_PATH = path.join(process.cwd(), 'apps/cli/dist/index.js');

// Load multi-model config if available
const configPath = path.join(TEST_DIR, 'config.json');
if (fs.existsSync(configPath)) {
  const config = fs.readFileSync(configPath, 'utf-8');
  process.env.LLM_MODELS_CONFIG = config;
  console.log('✅ Loaded multi-model config from', configPath);
}

function cleanup() {
  console.log('🧹 Cleaning up previous test stories...');
  try {
    const storiesDir = path.join(TEST_DIR, 'stories');
    if (fs.existsSync(storiesDir)) {
      const entries = fs.readdirSync(storiesDir);
      for (const entry of entries) {
        // Remove all stories with "Test" in the title or all stories for clean test
        const biblePath = path.join(storiesDir, entry, 'bible.json');
        let shouldRemove = entry.includes('test') || entry.includes('Test');
        
        if (fs.existsSync(biblePath)) {
          try {
            const bible = JSON.parse(fs.readFileSync(biblePath, 'utf-8'));
            if (bible.title === TEST_STORY_TITLE) {
              shouldRemove = true;
            }
          } catch (e) {
            // Ignore read errors
          }
        }
        
        if (shouldRemove) {
          fs.rmSync(path.join(storiesDir, entry), { recursive: true, force: true });
          console.log(`  Removed: ${entry}`);
        }
      }
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}

function runCommand(cmd: string, options: { input?: string; timeout?: number } = {}) {
  console.log(`\n$ ${cmd}`);
  try {
    const result = execSync(cmd, {
      encoding: 'utf-8',
      stdio: options.input ? 'pipe' : 'inherit',
      timeout: options.timeout || 300000, // 5 min default
      cwd: 'C:\\Users\\David\\Documents\\GitHub\\narritive_os',
      env: { ...process.env, LLM_MODELS_CONFIG: process.env.LLM_MODELS_CONFIG }
    });
    if (options.input) {
      console.log(result);
    }
    return result;
  } catch (error: any) {
    console.error('Command failed:', error.message);
    if (error.stdout) console.log('stdout:', error.stdout);
    if (error.stderr) console.error('stderr:', error.stderr);
    throw error;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Narrative OS Full Workflow Test');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 0: Build packages
  console.log('📦 Step 0: Building packages...');
  runCommand('pnpm run build');

  // Step 1: Test nos init with flags (non-interactive)
  console.log('\n🎭 Step 1: Testing nos init...');
  cleanup();
  
  runCommand(`node "${CLI_PATH}" init --title "${TEST_STORY_TITLE}" --genre "Mystery" --theme "Redemption" --setting "Modern City" --tone "Suspenseful" --premise "A detective investigates disappearances." --chapters 3`, { timeout: 30000 });

  // Step 2: Find the story ID (look for the one with our test title)
  console.log('\n🔍 Step 2: Finding story ID...');
  
  const storiesDir = path.join(TEST_DIR, 'stories');
  // Wait a moment for filesystem to sync
  await new Promise(r => setTimeout(r, 500));
  
  const stories = fs.readdirSync(storiesDir).filter(f => {
    const biblePath = path.join(storiesDir, f, 'bible.json');
    if (!fs.existsSync(biblePath)) return false;
    const bible = JSON.parse(fs.readFileSync(biblePath, 'utf-8'));
    return bible.title === TEST_STORY_TITLE;
  });
  
  if (stories.length === 0) {
    throw new Error('Test story not found after init');
  }
  
  const storyId = stories[0];
  console.log(`✅ Found story: ${storyId}`);

  // Step 3: Check status
  console.log('\n📊 Step 3: Checking story status...');
  runCommand(`node "${CLI_PATH}" status ${storyId}`, { timeout: 10000 });

  // Step 4: Generate Chapter 1 (generates next chapter automatically)
  console.log('\n✍️  Step 4: Generating Chapter 1...');
  runCommand(`node "${CLI_PATH}" generate ${storyId}`, { timeout: 600000 }); // 10 min timeout

  // Step 5: Verify chapter was created
  console.log('\n✅ Step 5: Verifying chapter output...');
  const storyPath = path.join(storiesDir, storyId);
  const chaptersDir = path.join(storyPath, 'chapters');
  
  if (!fs.existsSync(chaptersDir)) {
    throw new Error('Chapters directory not created');
  }
  
  const chapters = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));
  console.log(`  Created ${chapters.length} chapter(s)`);
  
  if (chapters.length > 0) {
    const chapter1Path = path.join(chaptersDir, 'chapter-1.json');
    if (fs.existsSync(chapter1Path)) {
      const chapter1 = JSON.parse(fs.readFileSync(chapter1Path, 'utf-8'));
      console.log(`  Chapter 1 title: ${chapter1.title}`);
      console.log(`  Chapter 1 content length: ${chapter1.content?.length || 0} chars`);
      
      if (chapter1.content && chapter1.content.length > 100) {
        console.log('\n🎉 SUCCESS: Chapter 1 generated successfully!');
      } else {
        throw new Error('Chapter 1 content too short or missing');
      }
    } else {
      throw new Error('Chapter 1 file not found');
    }
  } else {
    throw new Error('No chapters generated');
  }

  // Step 6: Check memories were extracted
  console.log('\n🧠 Step 6: Checking narrative memories...');
  runCommand(`node "${CLI_PATH}" memories ${storyId}`, { timeout: 10000 });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  All tests passed! ✅');
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
