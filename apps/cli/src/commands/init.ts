import { createStoryBible, addCharacter, createStoryState } from '@narrative-os/engine';
import { saveStory } from '../config/store.js';

export async function initCommand(options: {
  title?: string;
  theme?: string;
  genre?: string;
  setting?: string;
  tone?: string;
  premise?: string;
  chapters?: string;
}) {
  console.log('Creating new story...\n');

  const title = options.title || 'Untitled Story';
  const theme = options.theme || 'Redemption';
  const genre = options.genre || 'Science Fiction';
  const setting = options.setting || 'Neo-Tokyo 2145';
  const tone = options.tone || 'Dark, philosophical';
  const premise = options.premise || 'A detective discovers a conspiracy that challenges everything she knows about reality.';
  const targetChapters = parseInt(options.chapters || '5');

  let bible = createStoryBible(title, theme, genre, setting, tone, premise, targetChapters);

  bible = addCharacter(
    bible,
    'Mira Kade',
    'protagonist',
    ['determined', 'cynical', 'brilliant'],
    ['uncover the truth', 'protect her sister']
  );

  bible = addCharacter(
    bible,
    'The Architect',
    'antagonist',
    ['charismatic', 'ruthless', 'visionary'],
    ['reshape society', 'eliminate obstacles']
  );

  const state = createStoryState(bible.id, targetChapters);

  saveStory(bible, state, []);

  console.log(`\n✅ Story created: ${title}`);
  console.log(`   ID: ${bible.id}`);
  console.log(`   Target chapters: ${targetChapters}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   • Generate Chapter 1:  nos generate ${bible.id}`);
  console.log(`   • View story bible:    nos bible ${bible.id}`);
  console.log(`   • Check status:        nos status ${bible.id}`);
}
