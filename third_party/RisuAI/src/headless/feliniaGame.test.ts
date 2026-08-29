import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildFeliniaCognitionPrompt,
  buildFeliniaPlanningPrompt,
  applyFeliniaProviderSettings,
  compileFeliniaDefinition,
  extractFeliniaCognition,
  findFeliniaTemporalViolations,
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
  it('maps every exposed engine setting into the Risu database', () => {
    const db = applyFeliniaProviderSettings({}, {
      base: 'https://example.invalid/v1', model: 'test-model', format: 'openai',
      frequencyPenalty: 0.37, presencePenalty: 0.19, topK: 42,
      repetitionPenalty: 1.08, minP: 0.05, topA: 0.1,
      requestRetries: 4, requestTimeoutSec: 321, stream: false,
      stopStrings: ['<END>', 'STOP'], generationSeed: 77,
      autoContinue: true, autoContinueMinTokens: 256, removeIncompleteResponse: true,
      additionalParams: [['service_tier', '"auto"']], applyAdditionalParamsToAll: true,
      useInstructPrompt: true, tokenizer: 'llama', instructChatTemplate: 'jinja', jinjaTemplate: '{{ messages }}',
      systemContentReplacement: 'SYS {{slot}}', systemRoleReplacement: 'assistant',
      assistantPrefill: 'prefill', postEndInnerFormat: 'tail', sendChatAsSystem: true, sendName: true,
      chainOfThought: true, customChainOfThought: true, maxThoughtTagDepth: 2,
      jsonSchemaEnabled: true, jsonSchema: '{"type":"object"}', strictJsonSchema: false, extractJson: 'result',
      thinkingTokens: 2048, thinkingType: 'adaptive', adaptiveThinkingEffort: 'xhigh',
      deepseekThinkingType: 'enabled', deepseekReasoningEffort: 'max', verbosity: 2,
      automaticCachePoint: true, claudeRetrievalCaching: true, claudeBatching: true,
      claudeOneHourCaching: true, antiServerOverloads: true, fallbackWhenBlankResponse: true,
      modelTools: ['search'], openAIFlexProcessing: true, streamGeminiThoughts: true,
    });
    expect({
      frequencyPenalty: db.frequencyPenalty, presencePenalty: db.PresensePenalty,
      topK: db.top_k, repetitionPenalty: db.repetition_penalty, minP: db.min_p, topA: db.top_a,
      retries: db.requestRetrys, timeout: db.localNetworkTimeoutSec, stream: db.useStreaming,
      stops: db.localStopStrings, seed: db.generationSeed, autoContinue: db.autoContinueChat,
      autoMin: db.autoContinueMinTokens, removeIncomplete: db.removeIncompleteResponse,
      params: db.additionalParams, paramsAll: db.applyAdditionalParamsToAll,
      instruct: db.useInstructPrompt, tokenizer: db.customTokenizer, template: db.instructChatTemplate,
      jinja: db.JinjaTemplate, systemReplacement: db.systemContentReplacement, systemRole: db.systemRoleReplacement,
      prefill: db.promptSettings.assistantPrefill, postEnd: db.promptSettings.postEndInnerFormat,
      chatSystem: db.promptSettings.sendChatAsSystem, sendName: db.promptSettings.sendName,
      cot: db.chainOfThought, customCot: db.promptSettings.customChainOfThought, thoughtDepth: db.promptSettings.maxThoughtTagDepth,
      jsonOn: db.jsonSchemaEnabled, json: db.jsonSchema, jsonStrict: db.strictJsonSchema, extract: db.extractJson,
      thinkingTokens: db.thinkingTokens, thinkingType: db.thinkingType, adaptive: db.adaptiveThinkingEffort,
      deepType: db.deepseekThinkingType, deepEffort: db.deepseekReasoningEffort, verbosity: db.verbosity,
      autoCache: db.automaticCachePoint, retrieval: db.claudeRetrivalCaching, batch: db.claudeBatching,
      hourCache: db.claude1HourCaching, overload: db.antiServerOverloads, blankFallback: db.fallbackWhenBlankResponse,
      tools: db.modelTools, flex: db.openAIFlexProcessing, geminiThoughts: db.streamGeminiThoughts,
    }).toEqual({
      frequencyPenalty: 37, presencePenalty: 19, topK: 42, repetitionPenalty: 1.08, minP: 0.05, topA: 0.1,
      retries: 4, timeout: 321, stream: false, stops: ['<END>', 'STOP'], seed: 77,
      autoContinue: true, autoMin: 256, removeIncomplete: true,
      params: [['service_tier', '"auto"']], paramsAll: true,
      instruct: true, tokenizer: 'llama', template: 'jinja', jinja: '{{ messages }}',
      systemReplacement: 'SYS {{slot}}', systemRole: 'assistant', prefill: 'prefill', postEnd: 'tail',
      chatSystem: true, sendName: true, cot: true, customCot: true, thoughtDepth: 2,
      jsonOn: true, json: '{"type":"object"}', jsonStrict: false, extract: 'result',
      thinkingTokens: 2048, thinkingType: 'adaptive', adaptive: 'xhigh', deepType: 'enabled', deepEffort: 'max', verbosity: 2,
      autoCache: true, retrieval: true, batch: true, hourCache: true, overload: true, blankFallback: true,
      tools: ['search'], flex: true, geminiThoughts: true,
    });
  });

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
    expect(definition.base.lorebook).toHaveLength(56);
    expect(definition.base.lorebook?.every((entry: any) => entry.lay === 'core' || entry.lay === 'style')).toBe(true);
    expect(definition.base.recursiveScanning).toBe(false);
    expect(assignedLore).toBe(2908);
    expect(definition.base.lorebook?.some((entry) => String(entry.title).includes('一九〇〇年的创伤'))).toBe(false);
    expect(definition.base.lorebook?.some((entry) => String(entry.title).includes('世界书总目'))).toBe(false);
  });

  it('applies one structural isolation firewall to all 41 eras, not a Rome special case', () => {
    const { content, eras } = fixture();
    const definition = compileFeliniaDefinition(content, eras);
    const sourceYears = new Map(eras.map((era: any) => [era.i, era.y]));
    const runtimeCore = definition.base.lorebook?.filter((entry: any) => entry.lay === 'core') || [];
    const runtimeCoreText = JSON.stringify(runtimeCore);

    expect(definition.eras.map((era) => era.index)).toEqual(eras.map((era: any) => era.i));
    expect(definition.eras.every((era) => era.lorebook?.every((entry: any) => entry.era === era.index))).toBe(true);
    expect(definition.npcs.every((npc) => npc.lorebook?.every((entry: any) => entry.era === npc.eraIndex))).toBe(true);
    expect(definition.npcs.every((npc) => sourceYears.has(npc.eraIndex))).toBe(true);
    expect(runtimeCoreText).not.toContain('电报键');
    expect(runtimeCoreText).not.toContain('法国猫娘可在殖民军');
    expect(runtimeCoreText).not.toContain('任何医院、军队、灾害系统');

    for (const era of definition.eras) {
      const year = Number(era.year);
      expect(Number.isFinite(year)).toBe(true);
      expect(findFeliniaTemporalViolations(era.system_prompt || '', year)).toEqual([]);
      expect(era.scenario).toContain(`当前纪年是${eras.find((source: any) => source.i === era.index).ys}`);
      expect(era.scenario).not.toContain('这是一部从初民写到近代的世界史');
    }
    const earliestSystem = definition.eras[0].system_prompt || '';
    expect(earliestSystem).not.toContain('新大陆');
    expect(earliestSystem).not.toContain('十九世纪');
    expect(earliestSystem).not.toContain('军饷与公民权');
    expect(earliestSystem).not.toContain('殖民');
    expect(earliestSystem).not.toContain('女医想分量脉');
    expect(earliestSystem).not.toContain('账房想谁这个月又没交');
    expect(earliestSystem).toContain('玩家选的那一年没有的东西，不许出现');
  });

  it('rejects explicit future dates and unmistakable later technology at every boundary', () => {
    expect(findFeliniaTemporalViolations('天津在一九〇〇年出了事。', 50)).not.toEqual([]);
    expect(findFeliniaTemporalViolations('电报机正在响。', 1700)).toContain('电报（1837年后）');
    expect(findFeliniaTemporalViolations('铁路上的火车驶过。', 1875)).toEqual([]);
    expect(findFeliniaTemporalViolations('一九〇〇年的北京危机。', 1905)).toEqual([]);
    expect(findFeliniaTemporalViolations('玩家选的那一年没有的东西不许出现。', -10000)).toEqual([]);
    expect(findFeliniaTemporalViolations('她在这里生活了五十年。', -10000)).toEqual([]);
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
