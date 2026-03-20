import { createStoryBible, createStoryState, generateCharacters } from '@narrative-os/engine';
import { registry as genreRegistry } from '@narrative-os/genres';
import { registry as skillRegistry } from '@narrative-os/skills';
import { saveStory } from '../config/store.js';
import { input, select, number, confirm, checkbox } from '@inquirer/prompts';

type Language = 'en' | 'zh';

interface InitOptions {
  title?: string;
  theme?: string;
  genre?: string;
  setting?: string;
  tone?: string;
  premise?: string;
  chapters?: string;
}

function getGenreDisplayName(genre: any, language: Language): string {
  if (language === 'zh' && genre.displayName?.zh) {
    return `${genre.displayName.zh} (${genre.name})`;
  }
  return genre.displayName?.en || genre.name;
}

function getSkillDisplayName(skill: any, language: Language): string {
  if (language === 'zh' && skill.displayName?.zh) {
    return `${skill.displayName.zh} (${skill.name})`;
  }
  return skill.displayName?.en || skill.name;
}

function combineSkills(primaryGenre: string, secondaryGenre?: string): string[] {
  const primary = genreRegistry.get(primaryGenre);
  const secondary = secondaryGenre ? genreRegistry.get(secondaryGenre) : null;
  
  const skills = new Set<string>(primary?.defaultSkills || []);
  
  if (secondary?.defaultSkills) {
    secondary.defaultSkills.forEach(skill => skills.add(skill));
  }
  
  // Limit to 5 skills max
  return Array.from(skills).slice(0, 5);
}

export async function initCommand(options: InitOptions) {
  console.log('🎭 Creating new story...\n');

  // Step 1: Language Selection
  const language = await select<Language>({
    message: 'Choose language / 选择语言:',
    choices: [
      { name: 'English', value: 'en' },
      { name: '中文 (Chinese)', value: 'zh' }
    ]
  });

  const isChinese = language === 'zh';

  // Step 2: Primary Genre Selection
  const allGenres = genreRegistry.getAll();
  const primaryGenre = await select<string>({
    message: isChinese ? '选择主类型:' : 'Choose primary genre:',
    choices: allGenres.map(g => ({
      name: getGenreDisplayName(g, language),
      value: g.name,
      description: g.description
    }))
  });

  // Step 3: Secondary Genre (Optional)
  const addSecondary = await confirm({
    message: isChinese ? '添加副类型?' : 'Add secondary genre for flavor?',
    default: false
  });

  let secondaryGenre: string | undefined;
  if (addSecondary) {
    const otherGenres = allGenres.filter(g => g.name !== primaryGenre);
    secondaryGenre = await select<string>({
      message: isChinese ? '选择副类型:' : 'Choose secondary genre:',
      choices: otherGenres.map(g => ({
        name: getGenreDisplayName(g, language),
        value: g.name,
        description: g.description
      }))
    });
  }

  // Get genre info for defaults
  const primaryGenreInfo = genreRegistry.get(primaryGenre);

  // Step 4: Theme
  const theme = options.theme || await input({
    message: isChinese ? '主题 (如: 救赎、爱情、背叛):' : 'Theme (e.g., Redemption, Love, Betrayal):',
    default: isChinese ? '救赎' : 'Redemption'
  });

  // Step 5: Setting
  const setting = options.setting || await input({
    message: isChinese ? '背景 (时间/地点):' : 'Setting (time/place):',
    default: isChinese ? '现代都市' : 'Modern day'
  });

  // Step 6: Tone
  const tone = options.tone || await input({
    message: isChinese ? '基调 (如: 黑暗、轻松、悬疑):' : 'Tone (e.g., Dark, Lighthearted, Suspenseful):',
    default: isChinese ? '戏剧性' : 'Dramatic'
  });

  // Step 7: Premise
  const premise = options.premise || await input({
    message: isChinese ? '故事简介:' : 'Brief premise/synopsis:',
    validate: (value) => value.trim().length > 10 || (isChinese ? '请提供更详细的简介 (至少10个字符)' : 'Please provide a more detailed premise (at least 10 characters)')
  });

  // Step 8: Target Chapters
  const defaultChapters = primaryGenreInfo?.defaultChapterCount || 20;
  const targetChapters = options.chapters 
    ? parseInt(options.chapters)
    : await number({
        message: isChinese ? '目标章节数:' : 'Target number of chapters:',
        default: defaultChapters,
        min: 1,
        max: 200
      }) || defaultChapters;

  // Step 9: Skills Selection
  const defaultSkills = combineSkills(primaryGenre, secondaryGenre);
  const allSkills = skillRegistry.list().map(name => skillRegistry.get(name)).filter((s): s is NonNullable<typeof s> => s !== null && s !== undefined);
  
  const customizeSkills = await confirm({
    message: isChinese ? '自定义写作技巧?' : 'Customize writing skills?',
    default: false
  });

  let selectedSkills: string[] = defaultSkills;
  if (customizeSkills) {
    selectedSkills = await checkbox<string>({
      message: isChinese ? '选择写作技巧:' : 'Select writing skills:',
      choices: allSkills.map(s => ({
        name: getSkillDisplayName(s, language),
        value: s.name,
        checked: defaultSkills.includes(s.name)
      })),
      validate: (selected) => selected.length > 0 || (isChinese ? '至少选择一个技巧' : 'Please select at least one skill')
    });
  }

  // Step 10: Title (auto-generate or ask)
  const title = options.title || await input({
    message: isChinese ? '故事标题:' : 'Story title:',
    default: isChinese ? '未命名故事' : 'Untitled Story',
    validate: (value) => value.trim().length > 0 || (isChinese ? '标题不能为空' : 'Title is required')
  });

  // Create story bible
  const genreString = secondaryGenre 
    ? `${primaryGenre} + ${secondaryGenre}` 
    : primaryGenre;

  let bible = createStoryBible(title, theme, genreString, setting, tone, premise, targetChapters);

  // Generate characters
  console.log(isChinese ? '  🎭 生成角色...' : '  🎭 Generating characters...');
  const characters = await generateCharacters(title, premise, genreString, setting, bible.language);
  bible.characters = characters;
  
  console.log(isChinese 
    ? `     创建了 ${characters.length} 个角色:` 
    : `     Created ${characters.length} characters:`
  );
  characters.forEach(char => {
    const roleDisplay = char.role === 'protagonist' 
      ? (isChinese ? '主角' : 'protagonist')
      : char.role;
    console.log(`     • ${char.name} (${roleDisplay})`);
  });

  // Create state with skills
  const state = createStoryState(bible.id, targetChapters);
  
  // Save story with skills configuration
  saveStory(bible, state, []);

  // Output summary
  console.log(`\n✅ ${isChinese ? '故事已创建' : 'Story created'}: "${title}"`);
  console.log(`   ID: ${bible.id}`);
  console.log(`   ${isChinese ? '主类型' : 'Primary Genre'}: ${primaryGenre}`);
  if (secondaryGenre) {
    console.log(`   ${isChinese ? '副类型' : 'Secondary Genre'}: ${secondaryGenre}`);
  }
  console.log(`   ${isChinese ? '语言' : 'Language'}: ${language === 'zh' ? '中文' : 'English'}`);
  console.log(`   ${isChinese ? '目标章节' : 'Target chapters'}: ${targetChapters}`);
  console.log(`   ${isChinese ? '写作技巧' : 'Skills'}: ${selectedSkills.join(', ')}`);
  
  console.log(`\n💡 ${isChinese ? '下一步:' : 'Next steps:'}`);
  console.log(`   ${isChinese ? '• 生成第1章:' : '• Generate Chapter 1:'}  nos generate ${bible.id}`);
  console.log(`   ${isChinese ? '• 查看故事圣经:' : '• View story bible:'}    nos bible ${bible.id}`);
  console.log(`   ${isChinese ? '• 检查状态:' : '• Check status:'}        nos status ${bible.id}`);
}
