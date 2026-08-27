import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileFeliniaDefinition } from './feliniaGame';

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
});
