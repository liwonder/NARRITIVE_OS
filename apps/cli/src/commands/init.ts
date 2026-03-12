import { createStoryBible, addCharacter, createStoryState } from '@narrative-os/engine';
import { saveStory } from '../config/store.js';
import { input, select, number } from '@inquirer/prompts';

export async function initCommand(options: {
  title?: string;
  theme?: string;
  genre?: string;
  setting?: string;
  tone?: string;
  premise?: string;
  chapters?: string;
}) {
  console.log('🎭 Creating new story...\n');

  // Prompt for required fields if not provided via CLI
  const title = options.title || await input({
    message: 'Story title:',
    validate: (value) => value.trim().length > 0 || 'Title is required'
  });

  const genre = options.genre || await select({
    message: 'Genre:',
    choices: [
      { name: 'Science Fiction', value: 'Science Fiction' },
      { name: 'Fantasy', value: 'Fantasy' },
      { name: 'Mystery', value: 'Mystery' },
      { name: 'Thriller', value: 'Thriller' },
      { name: 'Romance', value: 'Romance' },
      { name: 'Historical Fiction', value: 'Historical Fiction' },
      { name: 'Horror', value: 'Horror' },
      { name: 'Literary Fiction', value: 'Literary Fiction' },
      { name: 'Other', value: 'Other' }
    ]
  });

  const theme = options.theme || await input({
    message: 'Theme (e.g., Redemption, Love, Betrayal):',
    default: 'Redemption'
  });

  const setting = options.setting || await input({
    message: 'Setting (time/place):',
    default: 'Modern day'
  });

  const tone = options.tone || await input({
    message: 'Tone (e.g., Dark, Lighthearted, Suspenseful):',
    default: 'Dramatic'
  });

  const premise = options.premise || await input({
    message: 'Brief premise/synopsis:',
    validate: (value) => value.trim().length > 10 || 'Please provide a more detailed premise (at least 10 characters)'
  });

  const targetChapters = options.chapters 
    ? parseInt(options.chapters)
    : await number({
        message: 'Target number of chapters:',
        default: 5,
        min: 1,
        max: 50
      }) || 5;

  let bible = createStoryBible(title, theme, genre, setting, tone, premise, targetChapters);

  // Add a placeholder protagonist (user can add more characters later)
  bible = addCharacter(
    bible,
    'Protagonist',
    'protagonist',
    ['brave', 'determined'],
    ['achieve their goal']
  );

  const state = createStoryState(bible.id, targetChapters);

  saveStory(bible, state, []);

  console.log(`\n✅ Story created: "${title}"`);
  console.log(`   ID: ${bible.id}`);
  console.log(`   Genre: ${genre}`);
  console.log(`   Target chapters: ${targetChapters}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   • Generate Chapter 1:  nos generate ${bible.id}`);
  console.log(`   • View story bible:    nos bible ${bible.id}`);
  console.log(`   • Check status:        nos status ${bible.id}`);
}
