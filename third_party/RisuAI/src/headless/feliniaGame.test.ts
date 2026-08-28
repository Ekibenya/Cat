import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  compileFeliniaDefinition,
  mergeFeliniaNativeCharacterFields,
  risuMessage,
} from './feliniaGame';

function fixture() {
  const repository = resolve(process.cwd(), '../..');
  const eras = JSON.parse(readFileSync(resolve(repository, 'core/res/data/felinia/eras.json'), 'utf8'));
  const html = readFileSync(resolve(repository, 'core/vendor/three/build/chunks/9d717bc0/156a50943028.html'), 'utf8');
  const embedded = html.match(/window\.__GAME_LUZHI__ = (\{.*?\});\n/);
  expect(embedded).not.toBeNull();
  return { content: JSON.parse(embedded![1]), eras };
}

describe('FELINIA fixed Risu runtime data', () => {
  it('compiles all eras, preset characters and lore exactly once', () => {
    const { content, eras } = fixture();
    const definition = compileFeliniaDefinition(content, eras);
    expect(definition.eras).toHaveLength(41);
    expect(definition.npcs).toHaveLength(590);
    expect(new Set(definition.npcs.map((npc) => npc.key)).size).toBe(590);
    const assignedLore = (definition.base.lorebook?.length || 0)
      + definition.eras.reduce((total, era) => total + (era.lorebook?.length || 0), 0)
      + definition.npcs.reduce((total, npc) => total + (npc.lorebook?.length || 0), 0);
    expect(assignedLore).toBe(content.lorebook.length);
    expect(assignedLore).toBe(4448);
  });

  it('partitions every NPC into exactly one of the 41 eras', () => {
    const { content, eras } = fixture();
    const definition = compileFeliniaDefinition(content, eras);
    const firstEraNpcs = definition.npcs.filter((entry) => entry.eraIndex === 1);
    const validEraIndexes = new Set(definition.eras.map((entry) => entry.index));
    expect(firstEraNpcs).toHaveLength(14);
    expect(definition.npcs.every((entry) => validEraIndexes.has(entry.eraIndex))).toBe(true);
    expect(definition.npcs.every((entry) => entry.key.startsWith(`era:${entry.eraIndex}:npc:`))).toBe(true);
  });

  it('activates relationship lore only when a related character name is present', () => {
    const { content, eras } = fixture();
    const definition = compileFeliniaDefinition(content, eras);
    const lilith = definition.npcs.find((entry) => entry.eraIndex === 1 && entry.name === '莉莉丝');
    const relation = lilith?.lorebook?.find((entry) => String(entry.title).includes('第五项 · 关系'));
    expect(relation?.keys).toEqual(['该隐', '潘多拉', '伏羲']);
  });

  it('merges active NPC native fields without polluting the era-only baseline', () => {
    const base = {
      desc: 'ERA_DESC', personality: 'ERA_PERSONALITY', scenario: 'ERA_SCENARIO', exampleMessage: 'ERA_EXAMPLE',
    };
    const merged = mergeFeliniaNativeCharacterFields(base, [{
      name: '莉莉丝', desc: 'NPC_DESC', personality: 'NPC_PERSONALITY', exampleMessage: 'NPC_EXAMPLE',
    }]);
    expect(merged.desc).toContain('NPC_DESC');
    expect(merged.personality).toContain('NPC_PERSONALITY');
    expect(merged.personality).toContain('NPC_EXAMPLE');
    expect(merged.exampleMessage).toContain('NPC_EXAMPLE');
    expect(base.desc).toBe('ERA_DESC');
    expect(mergeFeliniaNativeCharacterFields(base, [])).toEqual(base);
  });

  it('keeps canonical Korean separate from the display-language lore scan alias', () => {
    const message = risuMessage({
      role: 'user', content: '부두의 바람을 살핀다.', scanContent: '港口的风很冷。',
    });
    expect(message.data).toBe('부두의 바람을 살핀다.');
    expect(message.scanData).toBe('港口的风很冷。');
  });
});
