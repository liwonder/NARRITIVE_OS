#!/usr/bin/env tsx
"use strict";
/**
 * Full workflow integration test
 * Tests: init -> generate chapter 1 -> verify output
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
// Test with Chinese title to verify language detection
const TEST_STORY_TITLE = '失踪之谜';
const TEST_DIR = path_1.default.join(os_1.default.homedir(), '.narrative-os');
// Use globally installed CLI
const CLI_CMD = 'nos';
// Load multi-model config if available
const configPath = path_1.default.join(TEST_DIR, 'config.json');
if (fs_1.default.existsSync(configPath)) {
    const config = fs_1.default.readFileSync(configPath, 'utf-8');
    process.env.LLM_MODELS_CONFIG = config;
    console.log('✅ Loaded multi-model config from', configPath);
}
function cleanup() {
    console.log('🧹 Cleaning up previous test stories...');
    try {
        const storiesDir = path_1.default.join(TEST_DIR, 'stories');
        if (fs_1.default.existsSync(storiesDir)) {
            const entries = fs_1.default.readdirSync(storiesDir);
            for (const entry of entries) {
                // Remove all stories with "Test" in the title or all stories for clean test
                const biblePath = path_1.default.join(storiesDir, entry, 'bible.json');
                let shouldRemove = entry.includes('test') || entry.includes('Test');
                if (fs_1.default.existsSync(biblePath)) {
                    try {
                        const bible = JSON.parse(fs_1.default.readFileSync(biblePath, 'utf-8'));
                        if (bible.title === TEST_STORY_TITLE) {
                            shouldRemove = true;
                        }
                    }
                    catch (e) {
                        // Ignore read errors
                    }
                }
                if (shouldRemove) {
                    fs_1.default.rmSync(path_1.default.join(storiesDir, entry), { recursive: true, force: true });
                    console.log(`  Removed: ${entry}`);
                }
            }
        }
    }
    catch (e) {
        // Ignore cleanup errors
    }
}
function runCommand(cmd, options = {}) {
    console.log(`\n$ ${cmd}`);
    try {
        const result = (0, child_process_1.execSync)(cmd, {
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
    }
    catch (error) {
        console.error('Command failed:', error.message);
        if (error.stdout)
            console.log('stdout:', error.stdout);
        if (error.stderr)
            console.error('stderr:', error.stderr);
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
    runCommand(`${CLI_CMD} init --title "${TEST_STORY_TITLE}" --genre "悬疑" --theme "救赎" --setting "现代都市" --tone "紧张悬疑" --premise "一位侦探调查一系列神秘失踪案件，在追寻真相的过程中面对自己的过去。" --chapters 3`, { timeout: 30000 });
    // Step 2: Find the story ID (look for the one with our test title)
    console.log('\n🔍 Step 2: Finding story ID...');
    const storiesDir = path_1.default.join(TEST_DIR, 'stories');
    // Wait a moment for filesystem to sync
    await new Promise(r => setTimeout(r, 500));
    const stories = fs_1.default.readdirSync(storiesDir).filter(f => {
        const biblePath = path_1.default.join(storiesDir, f, 'bible.json');
        if (!fs_1.default.existsSync(biblePath))
            return false;
        const bible = JSON.parse(fs_1.default.readFileSync(biblePath, 'utf-8'));
        return bible.title === TEST_STORY_TITLE;
    });
    if (stories.length === 0) {
        throw new Error('Test story not found after init');
    }
    const storyId = stories[0];
    console.log(`✅ Found story: ${storyId}`);
    // Step 3: Check status
    console.log('\n📊 Step 3: Checking story status...');
    runCommand(`${CLI_CMD} status ${storyId}`, { timeout: 10000 });
    // Step 4: Generate Chapter 1 (generates next chapter automatically)
    console.log('\n✍️  Step 4: Generating Chapter 1...');
    runCommand(`${CLI_CMD} generate ${storyId}`, { timeout: 600000 }); // 10 min timeout
    // Step 5: Verify chapter was created
    console.log('\n✅ Step 5: Verifying chapter output...');
    const storyPath = path_1.default.join(storiesDir, storyId);
    const chaptersFile = path_1.default.join(storyPath, 'chapters.json');
    if (!fs_1.default.existsSync(chaptersFile)) {
        throw new Error('Chapters file not created');
    }
    const chapters = JSON.parse(fs_1.default.readFileSync(chaptersFile, 'utf-8'));
    console.log(`  Created ${chapters.length} chapter(s)`);
    if (chapters.length > 0) {
        const chapter1 = chapters[0];
        console.log(`  Chapter 1 title: ${chapter1.title}`);
        console.log(`  Chapter 1 content length: ${chapter1.content?.length || 0} chars`);
        if (chapter1.content && chapter1.content.length > 100) {
            console.log('\n🎉 SUCCESS: Chapter 1 generated successfully!');
        }
        else {
            throw new Error('Chapter 1 content too short or missing');
        }
    }
    else {
        throw new Error('No chapters generated');
    }
    // Step 6: Verify Chinese content
    console.log('\n🇨🇳 Step 6: Verifying Chinese language generation...');
    const chapter1Content = chapters[0].content;
    const chineseCharCount = (chapter1Content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const totalCharCount = chapter1Content.length;
    const chineseRatio = chineseCharCount / totalCharCount;
    console.log(`  Chinese characters: ${chineseCharCount}`);
    console.log(`  Total characters: ${totalCharCount}`);
    console.log(`  Chinese ratio: ${(chineseRatio * 100).toFixed(1)}%`);
    if (chineseRatio < 0.3) {
        throw new Error(`Content does not appear to be in Chinese (only ${(chineseRatio * 100).toFixed(1)}% Chinese characters)`);
    }
    console.log('  ✅ Content verified as Chinese!');
    // Step 7: Check memories were extracted
    console.log('\n🧠 Step 7: Checking narrative memories...');
    runCommand(`${CLI_CMD} memories ${storyId}`, { timeout: 10000 });
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  All tests passed! ✅');
    console.log('═══════════════════════════════════════════════════════');
}
main().catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
});
