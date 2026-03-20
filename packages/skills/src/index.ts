export { registry } from './registry.js';
export type { Skill, SkillRegistry } from './types.js';

// Register built-in skills
import { registry } from './registry.js';
import { suspense } from './skills/suspense.js';
import { cliffhanger } from './skills/cliffhanger.js';
import { dialogueNatural } from './skills/dialogue.js';
import { worldbuilding } from './skills/worldbuilding.js';
import { foreshadowing } from './skills/foreshadowing.js';
import { emotionalDepth } from './skills/emotionalDepth.js';
import { pacingFast } from './skills/pacingFast.js';
import { pacingSlow } from './skills/pacingSlow.js';
import { showDontTell } from './skills/showDontTell.js';
import { characterVoice } from './skills/characterVoice.js';
import { atmosphere } from './skills/atmosphere.js';
import { irony } from './skills/irony.js';
import { themeExploration } from './skills/themeExploration.js';
import { redHerring } from './skills/redHerring.js';
import { unreliableNarrator } from './skills/unreliableNarrator.js';
import { comicTiming } from './skills/comicTiming.js';
import { flashback } from './skills/flashback.js';
import { innerMonologue } from './skills/innerMonologue.js';
import { sensoryDetail } from './skills/sensoryDetail.js';
import { subtext } from './skills/subtext.js';
import { symbolism } from './skills/symbolism.js';
import { juxtaposition } from './skills/juxtaposition.js';
import { restraint } from './skills/restraint.js';
import { callback } from './skills/callback.js';

// Register skills
registry.register(suspense);
registry.register(cliffhanger);
registry.register(dialogueNatural);
registry.register(worldbuilding);
registry.register(foreshadowing);
registry.register(emotionalDepth);
registry.register(pacingFast);
registry.register(pacingSlow);
registry.register(showDontTell);
registry.register(characterVoice);
registry.register(atmosphere);
registry.register(irony);
registry.register(themeExploration);
registry.register(redHerring);
registry.register(unreliableNarrator);
registry.register(comicTiming);
registry.register(flashback);
registry.register(innerMonologue);
registry.register(sensoryDetail);
registry.register(subtext);
registry.register(symbolism);
registry.register(juxtaposition);
registry.register(restraint);
registry.register(callback);

// Set genre defaults
registry.setGenreDefaults('thriller', ['suspense', 'cliffhanger', 'dialogue-natural', 'pacing-fast']);
registry.setGenreDefaults('mystery', ['suspense', 'dialogue-natural', 'foreshadowing', 'red-herring']);
registry.setGenreDefaults('romance', ['dialogue-natural', 'emotional-depth', 'pacing-slow']);
registry.setGenreDefaults('sci-fi', ['worldbuilding', 'dialogue-natural', 'theme-exploration']);
registry.setGenreDefaults('fantasy', ['worldbuilding', 'dialogue-natural', 'foreshadowing', 'atmosphere']);
registry.setGenreDefaults('horror', ['suspense', 'atmosphere', 'pacing-fast']);
registry.setGenreDefaults('literary', ['show-dont-tell', 'emotional-depth', 'theme-exploration', 'character-voice']);
registry.setGenreDefaults('comedy', ['comic-timing', 'irony', 'dialogue-natural']);
registry.setGenreDefaults('wuxia', ['suspense', 'foreshadowing', 'atmosphere', 'dialogue-natural']);
registry.setGenreDefaults('xianxia', ['worldbuilding', 'foreshadowing', 'atmosphere', 'dialogue-natural']);
registry.setGenreDefaults('modern-chinese', ['dialogue-natural', 'emotional-depth', 'subtext']);
