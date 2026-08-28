import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildFeliniaCognitionPrompt,
  buildFeliniaPlanningPrompt,
  compileFeliniaDefinition,
  extractFeliniaCognition,
  findRepeatedFeliniaDialogue,
  mergeFeliniaNativeCharacterFields,
  normalizeFeliniaCognition,
  parseFeliniaPlanningResponse,
  recoverFeliniaPlanning,
  risuMessage,
  stripFeliniaReasoning,
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
  it('compiles every era and character without installing unscoped historical research globally', () => {
    const { content, eras } = fixture();
    const definition = compileFeliniaDefinition(content, eras);
    expect(definition.eras).toHaveLength(41);
    expect(definition.npcs).toHaveLength(590);
    expect(new Set(definition.npcs.map((npc) => npc.key)).size).toBe(590);
    const assignedLore = (definition.base.lorebook?.length || 0)
      + definition.eras.reduce((total, era) => total + (era.lorebook?.length || 0), 0)
      + definition.npcs.reduce((total, npc) => total + (npc.lorebook?.length || 0), 0);
    expect(content.lorebook).toHaveLength(4448);
    expect(definition.base.lorebook).toHaveLength(57);
    expect(definition.base.lorebook?.every((entry: any) => entry.lay === 'core' || entry.lay === 'style')).toBe(true);
    expect(definition.base.recursiveScanning).toBe(false);
    expect(assignedLore).toBe(2909);
    expect(definition.base.lorebook?.some((entry) => String(entry.title).includes('一九〇〇年的创伤'))).toBe(false);
  });

  it('projects world and character archives to the selected year without deleting the source', () => {
    const { content, eras } = fixture();
    const definition = compileFeliniaDefinition(content, eras);
    const rome = definition.eras.find((entry) => entry.index === 8);
    const romeLore = JSON.stringify(rome?.lorebook || []);
    expect(romeLore).toContain('解放文书');
    expect(romeLore).not.toContain('一九〇〇年');
    expect(romeLore).not.toContain('罗马大火');
    expect(rome?.lorebook?.some((entry) => String(entry.title).endsWith('在场的人'))).toBe(false);

    const nero = definition.npcs.find((entry) => entry.eraIndex === 8 && entry.name === '尼禄');
    expect(nero?.description).toBe('物种：人类');
    expect(nero?.personality).toContain('通身白色');
    expect(nero?.personality).toContain('被骗了好几次');
    expect(nero?.personality).not.toContain('罗马大火');
    expect(nero?.personality).not.toContain('自杀');
    expect(nero?.lorebook?.map((entry) => entry.title)).toEqual([
      '尼禄 · 第二项 · 外貌',
      '尼禄 · 第四项 · 性情',
      '尼禄 · 第五项 · 关系',
      '尼禄 · 第六项 · 说话的样子',
    ]);
    const acte = definition.npcs.find((entry) => entry.eraIndex === 8 && entry.name === '阿克特');
    expect(JSON.stringify(acte)).not.toContain('尼禄死后');
    const tiNhinan = definition.npcs.find((entry) => entry.eraIndex === 19 && entry.name.includes('希南'));
    expect(JSON.stringify(tiNhinan)).not.toContain('二十世纪');

    const year1905 = definition.eras.find((entry) => entry.index === 40);
    expect(JSON.stringify(year1905?.lorebook || [])).toContain('一九〇〇年');
    expect(JSON.stringify(content.lorebook)).toContain('尼禄死后');
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

  it('keeps current character traits but does not turn archives or raw quotes into native examples', () => {
    const { content, eras } = fixture();
    const definition = compileFeliniaDefinition(content, eras);
    const pan = definition.npcs.find((entry) => entry.name === '潘金莲');
    expect(pan).toBeDefined();
    expect(pan?.quotes).toEqual(['「两文钱。」', '「不用了。」']);
    expect(pan?.mes_example).toBe('');
    expect(definition.npcs.every((entry) => entry.mes_example === '')).toBe(true);
    expect(pan?.personality).toContain('她话很少');
    expect(pan?.personality).toContain('她说出口的话极少');
    expect(pan?.personality).not.toContain('那个要求打折并索要赔偿的女顾客');
    expect(pan?.lorebook).toHaveLength(4);
    expect(pan?.lorebook?.some((entry) => String(entry.title).includes('第一项'))).toBe(false);
    expect(pan?.lorebook?.some((entry) => String(entry.title).includes('第三项'))).toBe(false);
  });

  it('merges active NPC native fields once without contaminating Risu exampleMessage', () => {
    const base = {
      desc: 'ERA_DESC', personality: 'ERA_PERSONALITY', scenario: 'ERA_SCENARIO', exampleMessage: 'ERA_EXAMPLE',
    };
    const merged = mergeFeliniaNativeCharacterFields(base, [{
      name: '莉莉丝', desc: 'NPC_DESC', personality: 'NPC_PERSONALITY', exampleMessage: 'NPC_EXAMPLE',
    }]);
    expect(merged.desc).toContain('NPC_DESC');
    expect(merged.personality).toContain('NPC_PERSONALITY');
    expect(merged.personality).not.toContain('NPC_EXAMPLE');
    expect(merged.personality).toContain('不得复用最近三回');
    expect(merged.exampleMessage).toBe('ERA_EXAMPLE');
    expect(base.desc).toBe('ERA_DESC');
    expect(mergeFeliniaNativeCharacterFields(base, [])).toEqual(base);
  });

  it('detects repeated character dialogue while ignoring cat suffix punctuation', () => {
    const previous = [
      '她摇了摇头。\n\n「不知道喵。」\n\n灯芯缩了一下。',
      '「这件事由客人决定喵。」',
    ];
    expect(findRepeatedFeliniaDialogue('「不知道喵！」\n\n她把钱推回去。', previous)).toEqual(['不知道喵']);
    expect(findRepeatedFeliniaDialogue('「我先去问问掌柜喵。」', previous)).toEqual([]);
  });

  it('removes completed and streaming reasoning before display or history', () => {
    expect(stripFeliniaReasoning('<Thoughts>先分析人物动机</Thoughts>\n真正正文')).toBe('真正正文');
    expect(stripFeliniaReasoning('<think>尚未闭合的流式推理')).toBe('');
    expect(stripFeliniaReasoning('```analysis\n内部规划\n```\n可见正文')).toBe('可见正文');
    expect(stripFeliniaReasoning('可见正文\n<felinia_state>{"v":1,"beat":"推进"}</felinia_state>')).toBe('可见正文');
    expect(stripFeliniaReasoning('可见正文\n<felinia_state>{"v":1')).toBe('可见正文');
    expect(risuMessage({
      role: 'assistant', content: '<reasoning>不能显示</reasoning>\n角色回复',
    }).data).toBe('角色回复');
  });

  it('extracts only compact save-safe dramatic state and never exposes it', () => {
    const result = extractFeliniaCognition(
      '正文先出现。\n<felinia_state>{"v":1,"beat":"门外脚步逼近","focus":"潘金莲","characters":[{"name":"潘金莲","knows":"门外有人","wants":"保住账本","next":"熄灯查看"}],"threads":["门外来客"],"avoid":["不知道喵"]}</felinia_state>',
    );
    expect(result.text).toBe('正文先出现。');
    expect(result.cognition?.focus).toBe('潘金莲');
    expect(result.cognition?.characters?.[0].next).toBe('熄灯查看');
    expect(result.cognition?.avoid).toEqual(['不知道喵']);
    expect(JSON.stringify(result.cognition)).not.toContain('<');
  });

  it('keeps the preceding state when a small model omits or corrupts the state tag', () => {
    const previous = { v: 1, beat: '旧线索仍未解决', threads: ['失踪的账簿'] };
    expect(extractFeliniaCognition('只有正文', previous).cognition?.threads).toEqual(['失踪的账簿']);
    expect(extractFeliniaCognition('正文<felinia_state>{坏 JSON}</felinia_state>', previous).cognition?.beat)
      .toBe('旧线索仍未解决');
    expect(normalizeFeliniaCognition({ v: 9, beat: '<b>推进</b>', unknown: 'DROP' }))
      .toEqual({ v: 1, beat: 'b 推进 /b' });
  });

  it('separates hidden planning from visible prose and accepts fenced planner JSON', () => {
    const planning = buildFeliniaPlanningPrompt({ v: 1, focus: '莉莉丝', threads: ['门外来客'] });
    expect(planning).toContain('不写小说正文');
    expect(planning).toContain('只输出一个有效 JSON');
    expect(planning).toContain('莉莉丝');
    const parsed = parseFeliniaPlanningResponse('```json\n{"v":1,"beat":"回应玩家敲门","focus":"莉莉丝"}\n```');
    expect(parsed?.beat).toBe('回应玩家敲门');
    const prose = buildFeliniaCognitionPrompt(parsed);
    expect(prose).toContain('已经完成');
    expect(prose).toContain('严格依照该计划回应玩家最后一句');
    expect(prose).toContain('不得输出 <felinia_state>');
    expect(recoverFeliniaPlanning({ v: 1, threads: ['旧账'] }, '我推开仓门').beat)
      .toContain('我推开仓门');
  });

  it('keeps canonical Korean separate from the display-language lore scan alias', () => {
    const message = risuMessage({
      role: 'user', content: '부두의 바람을 살핀다.', scanContent: '港口的风很冷。',
    });
    expect(message.data).toBe('부두의 바람을 살핀다.');
    expect(message.scanData).toBe('港口的风很冷。');
  });
});
