import { writeFileSync } from 'fs';
import { loadStory } from '../config/store.js';

export function exportCommand(storyId: string, format: string = 'markdown', output?: string) {
  const story = loadStory(storyId);
  
  if (!story) {
    console.error(`Story not found: ${storyId}`);
    process.exit(1);
  }

  const { bible, chapters } = story;
  
  let content: string;
  let extension: string;
  
  switch (format.toLowerCase()) {
    case 'txt':
    case 'text':
      content = exportAsText(bible, chapters);
      extension = 'txt';
      break;
    case 'md':
    case 'markdown':
    default:
      content = exportAsMarkdown(bible, chapters);
      extension = 'md';
      break;
  }
  
  const filename = output || `${bible.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
  writeFileSync(filename, content, 'utf-8');
  
  console.log(`✅ Exported ${chapters.length} chapters to ${filename}`);
}

function exportAsMarkdown(bible: any, chapters: any[]): string {
  const lines: string[] = [];
  
  // Title page
  lines.push(`# ${bible.title}`);
  lines.push('');
  lines.push(`**Theme:** ${bible.theme}`);
  lines.push(`**Genre:** ${bible.genre}`);
  lines.push(`**Setting:** ${bible.setting}`);
  lines.push(`**Tone:** ${bible.tone}`);
  lines.push('');
  lines.push(`## Premise`);
  lines.push(bible.premise);
  lines.push('');
  
  // Characters
  if (bible.characters.length > 0) {
    lines.push('## Characters');
    lines.push('');
    for (const char of bible.characters) {
      lines.push(`### ${char.name}`);
      lines.push(`- **Role:** ${char.role}`);
      lines.push(`- **Traits:** ${char.traits.join(', ')}`);
      lines.push(`- **Goals:** ${char.goals.join(', ')}`);
      if (char.background) {
        lines.push(`- **Background:** ${char.background}`);
      }
      lines.push('');
    }
  }
  
  // Chapters
  if (chapters.length > 0) {
    lines.push('---');
    lines.push('');
    
    for (const chapter of chapters) {
      lines.push(`# Chapter ${chapter.number}: ${chapter.title}`);
      lines.push('');
      lines.push(chapter.content);
      lines.push('');
      lines.push(`*Word count: ${chapter.wordCount}*`);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

function exportAsText(bible: any, chapters: any[]): string {
  const lines: string[] = [];
  
  lines.push(bible.title.toUpperCase());
  lines.push('');
  lines.push(`Theme: ${bible.theme}`);
  lines.push(`Genre: ${bible.genre}`);
  lines.push(`Setting: ${bible.setting}`);
  lines.push('');
  lines.push('PREMISE');
  lines.push(bible.premise);
  lines.push('');
  
  if (chapters.length > 0) {
    for (const chapter of chapters) {
      lines.push(`CHAPTER ${chapter.number}: ${chapter.title.toUpperCase()}`);
      lines.push('');
      lines.push(chapter.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }
  
  return lines.join('\n');
}
