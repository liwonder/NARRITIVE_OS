/**
 * Dynamic skill loader - loads skills from @narrative-os/skills if available
 * Falls back gracefully if skills package is not installed
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SkillsModule = any;

export interface SkillInfo {
  name: string;
  displayName: { en: string; zh: string };
  description: string;
  instructions: string;
  priority: number;
}

let skillsModule: SkillsModule | undefined;

/**
 * Try to load the skills module dynamically
 */
async function loadSkillsModule(): Promise<SkillsModule | undefined> {
  if (skillsModule) return skillsModule;
  
  try {
    skillsModule = await import('@narrative-os/skills');
    return skillsModule;
  } catch {
    // Skills package not installed - engine works without it
    return undefined;
  }
}

/**
 * Get skill information by name
 * Returns null if skill not found or skills package not available
 */
export async function getSkill(skillName: string): Promise<SkillInfo | null> {
  const mod = await loadSkillsModule();
  if (!mod) return null;
  
  try {
    const skill = mod.registry.get(skillName);
    return skill || null;
  } catch {
    return null;
  }
}

/**
 * Get all available skills
 * Returns empty array if skills package not available
 */
export async function getAllSkills(): Promise<SkillInfo[]> {
  const mod = await loadSkillsModule();
  if (!mod) return [];
  
  try {
    const names: string[] = mod.registry.list();
    return names.map((name: string) => mod.registry.get(name)).filter(Boolean) as SkillInfo[];
  } catch {
    return [];
  }
}

/**
 * Get default skills for a genre
 * Returns empty array if skills package not available
 */
export async function getDefaultSkillsForGenre(genre: string): Promise<string[]> {
  const mod = await loadSkillsModule();
  if (!mod) return [];
  
  try {
    return mod.registry.getDefaultsForGenre(genre) || [];
  } catch {
    return [];
  }
}

/**
 * Validate skill names and return valid ones
 * If skills package not available, returns all input skills (assumes valid)
 */
export async function validateSkills(skillNames: string[]): Promise<string[]> {
  const mod = await loadSkillsModule();
  if (!mod) return skillNames; // Trust CLI when skills not available
  
  const allSkills = mod.registry.list();
  return skillNames.filter(name => allSkills.includes(name));
}

/**
 * Get skill instructions for prompt
 * Returns formatted skill instructions or empty string
 */
export async function getSkillInstructions(skillNames: string[]): Promise<string> {
  const skills = await Promise.all(skillNames.map(name => getSkill(name)));
  const validSkills = skills.filter(Boolean) as SkillInfo[];
  
  if (validSkills.length === 0) return '';
  
  return validSkills
    .sort((a, b) => b.priority - a.priority)
    .map(skill => skill.instructions)
    .join('\n\n---\n\n');
}
