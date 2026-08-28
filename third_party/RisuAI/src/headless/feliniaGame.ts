import type {
  Chat,
  Database,
  Message,
  character,
  customscript,
  loreBook,
  triggerscript,
} from '../ts/storage/database.svelte';
import { LLMFormat } from '../ts/model/types';
import {
  clearFeliniaPalace,
  exportFeliniaPalace,
  importFeliniaPalace,
  prepareFeliniaPalace,
  syncFeliniaPalace,
} from './feliniaPalace';

type TurnRole = 'system' | 'user' | 'assistant' | 'char';

export interface FeliniaLoreEntry {
  id?: string | number;
  title?: string;
  name?: string;
  comment?: string;
  keys?: string[] | string;
  keys2?: string[] | string;
  secondary_keys?: string[] | string;
  content?: string;
  on?: boolean;
  enabled?: boolean;
  constant?: boolean;
  selective?: boolean;
  useRegex?: boolean;
  use_regex?: boolean;
  ord?: number;
  insertion_order?: number;
  prob?: number;
  probability?: number;
  useProbability?: boolean;
  caseSensitive?: boolean;
  case_sensitive?: boolean;
  fullWordMatching?: boolean;
  match_whole_words?: boolean;
  selectiveLogic?: number;
  delay?: number;
  depth?: number;
  position?: number | string;
  role?: number | string;
  folder?: string;
  mode?: string;
  extensions?: Record<string, unknown>;
}

export interface FeliniaCharacterContent {
  name?: string;
  description?: string;
  personality?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;
  creator_notes?: string;
  system_prompt?: string;
  post_history_instructions?: string;
  alternate_greetings?: string[];
  tags?: string[];
  creator?: string;
  character_version?: string;
  lorebook?: FeliniaLoreEntry[];
  regex?: customscript[];
  triggers?: triggerscript[];
  defaultVariables?: string | Record<string, unknown>;
  scanDepth?: number;
  loreTokenBudget?: number;
  recursiveScanning?: boolean;
  fullWordMatching?: boolean;
}

export interface FeliniaEraDefinition extends FeliniaCharacterContent {
  index: number;
  year?: number | string;
  label?: string;
}

export interface FeliniaNpcDefinition extends FeliniaCharacterContent {
  key: string;
  eraIndex: number;
  species?: string;
  title?: string;
  quotes?: string[];
}

export interface FeliniaGameDefinition {
  base: FeliniaCharacterContent;
  eras: FeliniaEraDefinition[];
  npcs: FeliniaNpcDefinition[];
}

export interface FeliniaLegacyFigure {
  n: string;
  sp?: string;
  ti?: string;
  v?: string;
  d?: string;
  q?: string[];
}

export interface FeliniaLegacyEra {
  i: number;
  y?: number;
  ys?: string;
  t?: string;
  s?: string;
  nm?: string;
  inst?: string;
  reg?: string;
  roles?: unknown;
  locs?: unknown[];
  figs?: FeliniaLegacyFigure[];
}

export interface FeliniaProvider {
  base: string;
  key?: string;
  model: string;
  format?: 'openai' | 'responses' | 'anthropic' | 'gemini' | 'mistral' | 'ollama';
  temperature?: number;
  topP?: number;
  /** -1=minimal/off, 0=low, 1=medium, 2=high (Risu's native scale). */
  reasoningEffort?: number;
  maxTokens?: number;
  contextTokens?: number;
  stream?: boolean;
  autofillRequestUrl?: boolean;
}

export interface FeliniaTurn {
  role: TurnRole;
  content: string;
  /** Display-language text used only by Risu's lorebook scanner. */
  scanContent?: string;
  name?: string;
  chatId?: string;
  time?: number;
  /** Stable game turn ordinal used to keep palace drawers aligned after loading a save. */
  memoryIndex?: number;
}

export interface FeliniaGenerateOptions {
  provider?: FeliniaProvider;
  signal?: AbortSignal;
  preview?: boolean;
  /** Minimum prose characters, excluding control blocks. A short first draft is regenerated once. */
  minChars?: number;
  maxShortRetries?: number;
  /** Save-scoped hidden dramatic state from the preceding accepted turn. */
  cognition?: unknown;
  /** Reports the hidden planning phase separately from visible prose generation. */
  onPhase?: (phase: 'planning' | 'writing') => void;
  onDelta?: (text: string) => void;
}

export interface FeliniaCognitionCharacter {
  name: string;
  knows?: string;
  wants?: string;
  pressure?: string;
  stance?: string;
  next?: string;
}

export interface FeliniaCognition {
  v: 1;
  beat?: string;
  focus?: string;
  characters?: FeliniaCognitionCharacter[];
  threads?: string[];
  avoid?: string[];
}

export interface FeliniaAuxRequestOptions {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string; name?: string }>;
  provider?: FeliniaProvider;
  signal?: AbortSignal;
  maxTokens?: number;
  onDelta?: (text: string) => void;
}

export interface FeliniaSessionContent {
  systemPrompt?: string;
  description?: string;
  personality?: string;
  scenario?: string;
  firstMessage?: string;
  postHistoryInstructions?: string;
  authorNote?: string;
  localLore?: FeliniaLoreEntry[];
  regexScripts?: customscript[];
  triggerScripts?: triggerscript[];
  defaultVariables?: string | Record<string, unknown>;
}

export interface FeliniaTranslationOptions {
  provider: 'google' | 'browser' | 'deepl' | 'deeplx' | 'bergamot' | 'llm' | 'off';
  deeplKey?: string;
  deeplFree?: boolean;
  deeplxUrl?: string;
  deeplxToken?: string;
  regenerate?: boolean;
}

export interface FeliniaMemoryOptions {
  enabled: boolean;
  mode?: 'hybrid' | 'local' | 'bge-ko' | 'lexical' | 'api' | 'off';
  apiKey?: string;
  sessionId?: string;
  budgetChars?: number;
  topK?: number;
  gpu?: boolean;
}

type Runtime = {
  database: typeof import('../ts/storage/database.svelte');
  process: typeof import('../ts/process/index.svelte');
  scripts: typeof import('../ts/process/scripts');
  stores: typeof import('../ts/stores.svelte');
  translator: typeof import('../ts/translator/translator');
  globalApi: typeof import('../ts/globalApi.svelte');
};

interface FeliniaRuntimeMeta {
  kind: 'era' | 'npc';
  key: string;
  eraIndex: number;
  baseLoreCount?: number;
  baseRegexCount?: number;
  baseTriggerCount?: number;
  baseDesc?: string;
  basePersonality?: string;
  baseScenario?: string;
  baseExampleMessage?: string;
  activeNpcKeys?: string[];
  palaceEnabled?: boolean;
  palaceSessionId?: string;
  palaceBudgetChars?: number;
  palaceTopK?: number;
  palaceGpu?: boolean;
  palaceVectors?: boolean;
  palaceRecallActive?: boolean;
}

type FeliniaNativeFields = Pick<character, 'desc' | 'personality' | 'scenario' | 'exampleMessage'>;

const FELINIA_ACTIVE_NPC_VARIATION = `【人物条目与台词样本的用法】
人物条目里的具体台词只用于辨认措辞、语气、敬语和句长，不是必须复诵的台词表，更不是口头禅。每回合必须依据眼前的新动作、新对象和新利害重新组织说法；不得照抄条目中的整句，也不得复用最近三回已经说过的同一句或同一种推脱。条目描述的局部反应只适用于它原本的情境：例如“不替客人决定”不等于遇到任何事都说做不了，“话少”也不等于对所有问题只会说不知道。角色可以沉默、点头、追问、改口、转移话题或采取具体行动，但不能把一种性情压扁成两句循环回复。`;

export function mergeFeliniaNativeCharacterFields(
  base: FeliniaNativeFields,
  activeNpcs: Array<Pick<character, 'name' | 'desc' | 'personality' | 'exampleMessage'>>,
): FeliniaNativeFields {
  const merged = { ...base };
  for (const npc of activeNpcs) {
    merged.desc = [merged.desc, `【当前在场角色 · ${npc.name}】\n${npc.desc || ''}`].filter(Boolean).join('\n\n');
    merged.personality = [
      merged.personality,
      `【${npc.name} · 性格与行为】\n${npc.personality || ''}`,
    ].filter(Boolean).join('\n\n');
    merged.scenario = [merged.scenario, `当前在场人物：${npc.name}`].filter(Boolean).join('\n');
  }
  if (activeNpcs.length) {
    merged.personality = [merged.personality, FELINIA_ACTIVE_NPC_VARIATION].filter(Boolean).join('\n\n');
  }
  return merged;
}

function isRelationshipEntry(entry: Pick<FeliniaLoreEntry, 'title' | 'comment'>): boolean {
  return /第五项\s*·\s*关系|关系/.test(String(entry.title || entry.comment || ''));
}

function isArchivedLifeSummary(entry: Pick<FeliniaLoreEntry, 'title' | 'comment'>): boolean {
  return /第一项\s*·\s*概要|第三项\s*·\s*来历/.test(String(entry.title || entry.comment || ''));
}

function isArchivedRoster(entry: Pick<FeliniaLoreEntry, 'title' | 'comment'>): boolean {
  return /〕在场的人$|〕在场的小人物$/.test(String(entry.title || entry.comment || ''));
}

const CHINESE_NUMBER_DIGITS: Record<string, number> = {
  '〇': 0, '零': 0, '○': 0,
  '一': 1, '二': 2, '两': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
};

function parseChineseNumber(source: string): number | null {
  if (/^\d+$/.test(source)) return Number(source);
  if (/^[〇零○一二两三四五六七八九]+$/.test(source)) {
    return Number([...source].map((character) => CHINESE_NUMBER_DIGITS[character]).join(''));
  }
  const units: Record<string, number> = { '十': 10, '百': 100, '千': 1000 };
  let total = 0;
  let section = 0;
  let number = 0;
  for (const character of source) {
    if (character in CHINESE_NUMBER_DIGITS) {
      number = CHINESE_NUMBER_DIGITS[character];
    } else if (character in units) {
      section += (number || 1) * units[character];
      number = 0;
    } else if (character === '万') {
      total += (section + number || 1) * 10000;
      section = 0;
      number = 0;
    } else {
      return null;
    }
  }
  return total + section + number;
}

function containsExplicitFutureDate(text: string, currentYear: number): boolean {
  const yearPattern = /(\u516c\u5143\u524d|\u524d)?([\d〇零○一二两三四五六七八九十百千万]{1,8})\u5e74/g;
  for (const match of text.matchAll(yearPattern)) {
    const parsed = parseChineseNumber(match[2]);
    if (parsed == null) continue;
    const year = match[1] ? -parsed : parsed;
    if (year > currentYear) return true;
  }
  const centuryPattern = /(\u516c\u5143\u524d|\u524d)?([\d〇零○一二两三四五六七八九十百]{1,5})\u4e16\u7eaa/g;
  for (const match of text.matchAll(centuryPattern)) {
    const parsed = parseChineseNumber(match[2]);
    if (parsed == null || parsed < 1) continue;
    const firstYear = match[1] ? -(parsed * 100) : ((parsed - 1) * 100) + 1;
    if (firstYear > currentYear) return true;
  }
  return false;
}

function projectLineToYear(line: string, currentYear: number): string {
  const sentences = line.match(/[^\u3002\uff01\uff1f\uff1b]+[\u3002\uff01\uff1f\uff1b]?/g) || [line];
  const kept = sentences.filter((sentence) => !containsExplicitFutureDate(sentence, currentYear)
    && !/\u540e\u4e16|\u540e\u6765/.test(sentence));
  if (!kept.length) return '';
  const projected = kept.join('').trim();
  return /^\s*\u00b7/.test(line) && !/^\s*\u00b7/.test(projected) ? `\u00b7 ${projected}` : projected;
}

function projectLoreContentToYear(content: string | undefined, currentYear: number): string {
  return String(content || '').split('\n')
    .map((line) => projectLineToYear(line, currentYear))
    .filter(Boolean)
    .join('\n');
}

function sharedEraWorldLines(
  entries: Array<FeliniaLoreEntry & { era?: number; lay?: string }>,
  eraCount: number,
): Set<string> {
  const erasByLine = new Map<string, Set<number>>();
  for (const entry of entries) {
    if (entry.era == null || entry.lay === 'figures') continue;
    for (const line of new Set(String(entry.content || '').split('\n').map((value) => value.trim()).filter(Boolean))) {
      const eras = erasByLine.get(line) || new Set<number>();
      eras.add(entry.era);
      erasByLine.set(line, eras);
    }
  }
  return new Set([...erasByLine.entries()]
    .filter(([, eras]) => eras.size === eraCount)
    .map(([line]) => line));
}

let runtimePromise: Promise<Runtime> | null = null;

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    try { return structuredClone(value); } catch {}
  }
  return JSON.parse(JSON.stringify(value));
}

function uid(): string {
  return globalThis.crypto?.randomUUID?.() || `felinia-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function list(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value.map(String).map((entry) => entry.trim()).filter(Boolean);
  return String(value || '').split(/[,，、|]/).map((entry) => entry.trim()).filter(Boolean);
}

function variables(value: FeliniaCharacterContent['defaultVariables']): string {
  if (typeof value === 'string') return value;
  if (!value) return '';
  return Object.entries(value).map(([key, entry]) => `${key}=${typeof entry === 'string' ? entry : JSON.stringify(entry)}`).join('\n');
}

function loreRole(role: FeliniaLoreEntry['role']): string | undefined {
  if (typeof role === 'number') return ['system', 'user', 'assistant'][role];
  if (role === 'system' || role === 'user' || role === 'assistant') return role;
  return undefined;
}

/* Mirrors the internal result of RisuAI's V3 lorebook conversion. The generic
 * card-file layer is deliberately absent; Risu's scanner receives its native
 * loreBook objects directly. */
function risuLore(source: FeliniaLoreEntry, index: number, prefix: string): loreBook | null {
  if (source.enabled === false || source.on === false) return null;
  const extensions = { ...(source.extensions || {}) } as Record<string, any>;
  let content = String(source.content || '');
  const probability = source.probability ?? source.prob;
  if ((source.useProbability ?? probability !== undefined) && probability !== undefined && probability !== 100) {
    content = `@@probability ${probability}\n${content}`;
  }
  const role = loreRole(source.role);
  if (source.position === 4 && typeof source.depth === 'number' && role) {
    content = `@@depth ${source.depth}\n@@role ${role}\n${content}`;
  }
  const secondary = list(source.secondary_keys ?? source.keys2);
  if (typeof source.selectiveLogic === 'number' && secondary.length) {
    if (source.selectiveLogic === 1) content = `@@exclude_keys_all ${secondary.join(',')}\n${content}`;
    if (source.selectiveLogic === 2) secondary.forEach((key) => { content = `@@exclude_keys ${key}\n${content}`; });
    if (source.selectiveLogic === 3) secondary.forEach((key) => { content = `@@additional_keys ${key}\n${content}`; });
  }
  if (typeof source.delay === 'number' && source.delay > 0) content = `@@activate_only_after ${source.delay}\n${content}`;
  const whole = source.match_whole_words ?? source.fullWordMatching;
  if (whole === true) content = `@@match_full_word\n${content}`;
  if (whole === false) content = `@@match_partial_word\n${content}`;
  extensions.risu_case_sensitive = source.case_sensitive ?? source.caseSensitive ?? false;
  return {
    id: String(source.id ?? `${prefix}-lore-${index}`),
    key: list(source.keys).join(', '),
    secondkey: secondary.join(', '),
    insertorder: source.insertion_order ?? source.ord ?? 100,
    comment: source.comment ?? source.title ?? source.name ?? `${prefix} ${index + 1}`,
    content,
    mode: (source.mode as loreBook['mode']) ?? 'normal',
    alwaysActive: source.constant ?? false,
    selective: source.selective ?? false,
    extentions: extensions,
    activationPercent: probability,
    loreCache: null,
    useRegex: source.use_regex ?? source.useRegex ?? false,
    folder: source.folder,
  };
}

function chat(): Chat {
  return { message: [], note: '', name: 'FELINIA', localLore: [], scriptstate: {}, fmIndex: -1, id: uid() };
}

function mergeContent(base: FeliniaCharacterContent, specific: FeliniaCharacterContent): FeliniaCharacterContent {
  return {
    ...base,
    ...specific,
    description: [base.description, specific.description].filter(Boolean).join('\n\n'),
    personality: [base.personality, specific.personality].filter(Boolean).join('\n\n'),
    scenario: [base.scenario, specific.scenario].filter(Boolean).join('\n\n'),
    system_prompt: [base.system_prompt, specific.system_prompt].filter(Boolean).join('\n\n'),
    post_history_instructions: [base.post_history_instructions, specific.post_history_instructions].filter(Boolean).join('\n\n'),
    mes_example: [base.mes_example, specific.mes_example].filter(Boolean).join('\n\n'),
    lorebook: [...(base.lorebook || []), ...(specific.lorebook || [])],
    regex: [...(base.regex || []), ...(specific.regex || [])],
    triggers: [...(base.triggers || []), ...(specific.triggers || [])],
    tags: [...new Set([...(base.tags || []), ...(specific.tags || [])])],
    alternate_greetings: specific.alternate_greetings || base.alternate_greetings,
    defaultVariables: specific.defaultVariables ?? base.defaultVariables,
  };
}

export function compileFeliniaDefinition(
  fixedContent: FeliniaCharacterContent & { lorebook?: Array<FeliniaLoreEntry & { era?: number; lay?: string; cat?: string }> },
  eraSource: FeliniaLegacyEra[],
): FeliniaGameDefinition {
  const allLore = fixedContent.lorebook || [];
  const repeatedWorldLines = sharedEraWorldLines(allLore, eraSource.length);
  /* Entries without an era are not automatically timeless. The source contains
   * 277 research/world entries about specific later periods (including Tianjin
   * and 1900) with no era number; installing those on all 41 cards lets a common
   * keyword activate modern history in antiquity. Only actual engine/style rules
   * are shared. The full source stays embedded for the FELINIA UI and editors. */
  const commonLore = allLore.filter((entry) => entry.era == null
    && (entry.lay === 'core' || entry.lay === 'style'));
  const base: FeliniaCharacterContent = {
    name: fixedContent.name || 'FELINIA',
    description: fixedContent.description,
    personality: fixedContent.personality,
    scenario: fixedContent.scenario,
    first_mes: fixedContent.first_mes,
    mes_example: fixedContent.mes_example,
    creator_notes: fixedContent.creator_notes,
    system_prompt: fixedContent.system_prompt,
    post_history_instructions: fixedContent.post_history_instructions,
    alternate_greetings: fixedContent.alternate_greetings,
    tags: fixedContent.tags,
    creator: fixedContent.creator,
    character_version: fixedContent.character_version,
    lorebook: commonLore,
    regex: fixedContent.regex,
    triggers: fixedContent.triggers,
    defaultVariables: fixedContent.defaultVariables,
    scanDepth: fixedContent.scanDepth,
    loreTokenBudget: fixedContent.loreTokenBudget,
    recursiveScanning: false,
    fullWordMatching: fixedContent.fullWordMatching,
  };
  const eras: FeliniaEraDefinition[] = [];
  const npcs: FeliniaNpcDefinition[] = [];
  for (const era of eraSource) {
    const currentYear = Number(era.y ?? 0);
    const eraCharacterNames = new Set((era.figs || []).map((figure) => figure.n));
    /* Each of the 41 era cards contains a short era-specific head followed by
     * the same 160-line transhistorical template. That template mentions later
     * institutions even on the prehistoric card. Timeless engine/style rules
     * already live in base lore, so an era card keeps only its own lines.
     * Roster biographies are lifetime summaries and remain archived in the
     * source/UI; they are never sent as current-year knowledge. */
    const eraLore = allLore.filter((entry) => entry.era === era.i
      && entry.lay !== 'figures' && !isArchivedRoster(entry))
      .flatMap((entry) => {
        const uniqueContent = String(entry.content || '').split('\n')
          .filter((line) => !repeatedWorldLines.has(line.trim()))
          .join('\n');
        const content = projectLoreContentToYear(uniqueContent, currentYear);
        return content ? [{ ...entry, content }] : [];
      });
    const temporalBoundary = [
      `【时间知识边界】当前纪年是${era.ys || era.y || '本时代'}。`,
      '可以知道并谈论当前纪年以前已经发生的历史；当前纪年以后的事件、结局、制度、地点称呼与人物命运一律尚未发生。',
      '资料若以整个人生回顾的口吻写到“后来”“后世”“死后”或最终结局，那只是封存档案，不是角色当下拥有的知识；不得预言、暗示或据此行动。',
    ].join('\n');
    eras.push({
      index: era.i,
      year: era.y,
      label: [era.ys, era.t].filter(Boolean).join(' · '),
      name: `FELINIA · ${[era.ys, era.t].filter(Boolean).join(' · ')}`,
      description: [era.s, era.nm].filter(Boolean).join('\n'),
      scenario: [
        era.ys ? `当前时代：${era.ys}` : '',
        era.t ? `时代场景：${era.t}` : '',
        era.s || '',
        era.inst || '',
        era.reg || '',
        temporalBoundary,
      ].filter(Boolean).join('\n'),
      lorebook: eraLore,
      defaultVariables: { felinia_era: era.i, felinia_year: era.y ?? '', felinia_era_label: era.ys ?? '' },
    });
    (era.figs || []).forEach((figure, figureIndex) => {
      const sourceFigureLore = allLore.filter((entry) => entry.era === era.i && entry.lay === 'figures'
        && (entry.cat === `人 · ${figure.n}` || String(entry.title || '').startsWith(`${figure.n} ·`)))
        .map((entry) => {
          /* 人物关系条目只应在另一个关系人的名字真正出现时触发。原资料还把
           * 「欠债、同伙、怕生」这类泛词当触发词；Flash 看到一句“不愿欠人情”
           * 就会注入该隐等未在场人物，随后擅自让他们进门。角色和关系内容一字
           * 不删，只把触发条件收紧为本时代的真实人名。 */
          if (!isRelationshipEntry(entry)) return entry;
          const relationNames = list(entry.keys).filter((key) => key !== figure.n && eraCharacterNames.has(key));
          return { ...entry, keys: relationNames.length ? relationNames : [`__FELINIA_RELATION_${era.i}_${figureIndex}__`] };
        });
      /* First/third items and figure.d are retrospective whole-life records.
       * They routinely disclose deaths and deeds decades after the selected
       * year. Preserve them in the embedded source, but build the playable
       * current snapshot from appearance, temperament, relationships and voice. */
      const figureLore = sourceFigureLore.filter((entry) => !isArchivedLifeSummary(entry))
        .flatMap((entry) => {
          const content = projectLoreContentToYear(entry.content, currentYear);
          return content ? [{ ...entry, content }] : [];
        });
      const key = `era:${era.i}:npc:${figureIndex}:${figure.n}`;
      const species = figure.sp === 'cat' ? '猫娘' : figure.sp === 'human' ? '人类' : (figure.sp || '');
      npcs.push({
        key,
        eraIndex: era.i,
        species: figure.sp,
        title: figure.ti,
        name: figure.n,
        description: species ? `物种：${species}` : '',
        /* 第二、第四与第六项构成这个已激活角色的当前本体，只放一次。
         * 第五项关系仍留在原生 lorebook，等另一个关系人的名字出现才触发。
         * 第一项概要、第三项来历及名单短简介是完整人生档案，不能在当年
         * 尚未发生时送进模型；原始资料仍完整保留在游戏内容与编辑界面。
         * figure.q 是资料索引里的摘句，不是 {{user}}/{{char}} 对话；把它塞进
         * Risu exampleMessage 会被解析成上一段 assistant 示例的续文，弱模型便
         * 会逐回照抄，因此只保存在 quotes 元数据中。 */
        personality: figureLore.filter((entry) => !isRelationshipEntry(entry))
          .map((entry) => entry.content || '').filter(Boolean).join('\n\n'),
        mes_example: '',
        quotes: figure.q,
        lorebook: figureLore,
        tags: ['FELINIA', `era:${era.i}`, figure.sp || '', figure.ti || ''].filter(Boolean),
        defaultVariables: {
          felinia_npc_key: key,
          felinia_era: era.i,
          felinia_species: figure.sp || '',
          felinia_title: figure.ti || '',
          felinia_sprite: figure.v || '',
        },
      });
    });
  }
  return { base, eras, npcs };
}

function createCharacter(content: FeliniaCharacterContent, meta: FeliniaRuntimeMeta): character {
  const prefix = meta.kind === 'era' ? `era-${meta.eraIndex}` : `npc-${meta.key}`;
  const globalLore = (content.lorebook || []).map((entry, index) => risuLore(entry, index, prefix)).filter((entry): entry is loreBook => !!entry);
  const regex = clone(content.regex || []);
  const triggers = clone(content.triggers || []);
  const runtimeMeta: FeliniaRuntimeMeta = {
    ...meta,
    baseLoreCount: globalLore.length,
    baseRegexCount: regex.length,
    baseTriggerCount: triggers.length,
    baseDesc: content.description || '',
    basePersonality: content.personality || '',
    baseScenario: content.scenario || '',
    baseExampleMessage: content.mes_example || '',
    activeNpcKeys: [],
  };
  return {
    type: 'character',
    name: content.name || (meta.kind === 'era' ? `FELINIA ${meta.eraIndex}` : meta.key),
    firstMessage: content.first_mes || '',
    desc: content.description || '',
    notes: '',
    chats: [chat()],
    chatFolders: [],
    chatPage: 0,
    viewScreen: 'none',
    bias: [],
    emotionImages: [],
    globalLore,
    chaId: uid(),
    sdData: [],
    customscript: regex,
    triggerscript: triggers,
    utilityBot: false,
    exampleMessage: content.mes_example || '',
    creatorNotes: content.creator_notes || '',
    systemPrompt: content.system_prompt || '',
    postHistoryInstructions: '',
    alternateGreetings: content.alternate_greetings || [],
    tags: content.tags || ['FELINIA'],
    creator: content.creator || '',
    characterVersion: content.character_version || '',
    personality: content.personality || '',
    scenario: content.scenario || '',
    firstMsgIndex: -1,
    removedQuotes: false,
    loreSettings: {
      /* Keep Risu's native defaults. The earlier adapter silently expanded these to
       * 9000 / 8, which injected almost twenty thousand extra characters per turn
       * and made ordinary Flash models slow and prone to unrelated lore jumps. */
      tokenBudget: content.loreTokenBudget ?? 800,
      scanDepth: content.scanDepth ?? 5,
      /* A matched entry must not activate another period merely because its body
       * happens to mention one of that period's keywords. */
      recursiveScanning: content.recursiveScanning ?? false,
      fullWordMatching: content.fullWordMatching ?? false,
    },
    loreExt: { risu_fullWordMatching: content.fullWordMatching ?? false },
    replaceGlobalNote: content.post_history_instructions || '',
    additionalText: '',
    extentions: { felinia: runtimeMeta },
    largePortrait: false,
    lorePlus: false,
    inlayViewScreen: false,
    imported: false,
    source: [],
    ccAssets: [],
    lowLevelAccess: false,
    defaultVariables: variables(content.defaultVariables),
    reloadKeys: 0,
    prebuiltAssetCommand: '',
    prebuiltAssetExclude: [],
    prebuiltAssetStyle: '',
    customModuleToggle: '',
    hideChatIcon: true,
  };
}

function meta(character: character): FeliniaRuntimeMeta | undefined {
  return character.extentions?.felinia as FeliniaRuntimeMeta | undefined;
}

async function runtime(): Promise<Runtime> {
  runtimePromise ||= Promise.all([
    import('../ts/storage/database.svelte'),
    import('../ts/process/index.svelte'),
    import('../ts/process/scripts'),
    import('../ts/stores.svelte'),
    import('../ts/translator/translator'),
    import('../ts/globalApi.svelte'),
  ]).then(([database, process, scripts, stores, translator, globalApi]) => ({ database, process, scripts, stores, translator, globalApi }));
  return runtimePromise;
}

function emptyDatabase(): Partial<Database> {
  return {
    characters: [],
    language: 'en',
    useStreaming: true,
    usePlainFetch: true,
    strictOpenAICompatible: true,
    inlayErrorResponse: true,
    botPresets: [],
    botPresetsId: 0,
  };
}

export async function installFeliniaGame(definition: FeliniaGameDefinition) {
  const rt = await runtime();
  rt.database.setDatabase(emptyDatabase() as Database);
  const eras = [...definition.eras].sort((a, b) => a.index - b.index).map((era) => {
    const content = mergeContent(definition.base, era);
    return createCharacter(content, { kind: 'era', key: `era:${era.index}`, eraIndex: era.index });
  });
  const npcs = definition.npcs.map((npc) => createCharacter(npc, {
    kind: 'npc', key: npc.key, eraIndex: npc.eraIndex,
  }));
  const db = rt.database.getDatabase();
  db.characters = [...eras, ...npcs];
  rt.stores.selectedCharID.set(eras.length ? 0 : -1);
  return { eras: eras.length, npcs: npcs.length, total: db.characters.length };
}

export async function installFeliniaContent(
  fixedContent: Parameters<typeof compileFeliniaDefinition>[0],
  eras: FeliniaLegacyEra[],
) {
  return installFeliniaGame(compileFeliniaDefinition(fixedContent, eras));
}

export async function activateFeliniaEra(eraIndex: number, npcKeys: string[] = []) {
  const rt = await runtime();
  const db = rt.database.getDatabase();
  const eraPosition = db.characters.findIndex((entry) => entry.type !== 'group' && meta(entry)?.kind === 'era' && meta(entry)?.eraIndex === eraIndex);
  if (eraPosition < 0) throw new Error(`FELINIA era ${eraIndex} is not installed`);
  const era = db.characters[eraPosition] as character;
  const eraMeta = meta(era)!;
  era.globalLore = era.globalLore.slice(0, eraMeta.baseLoreCount);
  era.customscript = era.customscript.slice(0, eraMeta.baseRegexCount);
  era.triggerscript = era.triggerscript.slice(0, eraMeta.baseTriggerCount);
  era.desc = eraMeta.baseDesc ?? era.desc;
  era.personality = eraMeta.basePersonality ?? era.personality;
  era.scenario = eraMeta.baseScenario ?? era.scenario;
  era.exampleMessage = eraMeta.baseExampleMessage ?? era.exampleMessage;
  const activeNpcs: character[] = [];
  for (const key of [...new Set(npcKeys)]) {
    const found = db.characters.find((entry) => entry.type !== 'group' && meta(entry)?.kind === 'npc' && meta(entry)?.key === key) as character | undefined;
    if (!found) continue;
    activeNpcs.push(found);
    /* 外貌、性情与说话方式已经作为 native personality 常驻，只让第五项关系
     * 继续走原生关键词扫描，避免同一份人物资料每回合注入两遍。 */
    era.globalLore.push(...clone(found.globalLore.filter((entry) =>
      /第五项\s*·\s*关系|关系/.test(String(entry.comment || ''))
    )));
    era.customscript.push(...clone(found.customscript));
    era.triggerscript.push(...clone(found.triggerscript));
  }
  /* An activated preset NPC is a real Risu character, not merely a bag of
   * triggerable lore. Merge its native description/personality into the era;
   * raw quote snippets deliberately remain outside native exampleMessage. */
  Object.assign(era, mergeFeliniaNativeCharacterFields({
    desc: era.desc,
    personality: era.personality,
    scenario: era.scenario,
    exampleMessage: era.exampleMessage,
  }, activeNpcs));
  eraMeta.activeNpcKeys = activeNpcs.map((entry) => meta(entry)!.key);
  era.extentions!.felinia = eraMeta;
  rt.stores.selectedCharID.set(eraPosition);
  rt.database.setCharacterByIndex(eraPosition, era);
  return { era: eraIndex, character: era, activeNpcs };
}

export async function setFeliniaSessionContent(content: FeliniaSessionContent) {
  const rt = await runtime();
  const current = rt.database.getCurrentCharacter();
  if (!current || current.type === 'group') throw new Error('No FELINIA era is active');
  if (content.systemPrompt !== undefined) current.systemPrompt = content.systemPrompt;
  if (content.description !== undefined) current.desc = content.description;
  if (content.personality !== undefined) current.personality = content.personality;
  if (content.scenario !== undefined) current.scenario = content.scenario;
  if (content.firstMessage !== undefined) current.firstMessage = content.firstMessage;
  if (content.postHistoryInstructions !== undefined) current.replaceGlobalNote = content.postHistoryInstructions;
  if (content.defaultVariables !== undefined) current.defaultVariables = variables(content.defaultVariables);
  const currentChat = current.chats[current.chatPage];
  if (content.authorNote !== undefined) currentChat.note = content.authorNote;
  if (content.localLore !== undefined) {
    currentChat.localLore = content.localLore.map((entry, index) => risuLore(entry, index, 'session')).filter((entry): entry is loreBook => !!entry);
  }
  if (content.regexScripts !== undefined) current.customscript.push(...clone(content.regexScripts));
  if (content.triggerScripts !== undefined) current.triggerscript.push(...clone(content.triggerScripts));
  rt.database.setCurrentCharacter(current);
  return current;
}

export async function configureFeliniaMemory(options: FeliniaMemoryOptions) {
  const rt = await runtime();
  const db = rt.database.getDatabase();
  const current = rt.database.getCurrentCharacter();
  if (!current || current.type === 'group') throw new Error('No FELINIA era is active');
  current.supaMemory = options.enabled && options.mode !== 'off';
  db.hypaV3 = current.supaMemory;
  db.hypav2 = false;
  db.hypaMemory = false;
  /* Both memory engines index locally. Only an explicit API embedding mode may
   * receive a key; hybrid/local modes must never borrow the player's chat key. */
  db.hypaModel = options.gpu === false ? 'multiMiniLM' : 'multiMiniLMGPU';
  const hypaPreset = db.hypaV3Presets?.[db.hypaV3PresetId];
  if (hypaPreset) {
    /* Keep the native HypaV3 index and selector, but file exact visible turns
     * instead of asking the player's chat/sub model to summarize them. */
    hypaPreset.settings.summarizationModel = 'feliniaVerbatim';
    hypaPreset.settings.maxChatsPerSummary = 2;
    hypaPreset.settings.queryChatCount = 4;
  }
  if (options.mode === 'api' && options.apiKey !== undefined) db.supaMemoryKey = options.apiKey;
  const runtimeMeta = meta(current);
  if (runtimeMeta) {
    runtimeMeta.palaceEnabled = current.supaMemory;
    runtimeMeta.palaceSessionId = String(options.sessionId || '');
    runtimeMeta.palaceBudgetChars = Math.max(400, Math.min(12000, options.budgetChars || 3000));
    runtimeMeta.palaceTopK = Math.max(1, Math.min(12, options.topK || 8));
    runtimeMeta.palaceGpu = options.gpu !== false;
    runtimeMeta.palaceVectors = options.mode !== 'lexical';
    runtimeMeta.palaceRecallActive = false;
    current.extentions!.felinia = runtimeMeta;
  }
  rt.database.setCurrentCharacter(current);
}

export async function configureFeliniaTranslation(options: FeliniaTranslationOptions) {
  const rt = await runtime();
  const db = rt.database.getDatabase();
  db.translatorType = options.provider === 'deeplx' ? 'deeplX' : options.provider;
  db.deeplOptions = { key: options.deeplKey || '', freeApi: options.deeplFree ?? true };
  db.deeplXOptions = { url: options.deeplxUrl || 'http://localhost:1188', token: options.deeplxToken || '' };
  db.feliniaFinalPromptTranslation = options.provider !== 'off';
}

export async function translateFelinia(
  text: string,
  from: string,
  to: string,
  options: FeliniaTranslationOptions,
) {
  if (!text || options.provider === 'off') return text;
  await configureFeliniaTranslation(options);
  const rt = await runtime();
  return rt.translator.runTranslator(text, true, from, to, {
    regenerate: options.regenerate,
    throwOnError: true,
  });
}

export async function setFeliniaNpcState(key: string, state: Record<string, string | number | boolean>) {
  const rt = await runtime();
  const db = rt.database.getDatabase();
  const position = db.characters.findIndex((entry) => entry.type !== 'group' && meta(entry)?.kind === 'npc' && meta(entry)?.key === key);
  if (position < 0) throw new Error(`FELINIA character ${key} is not installed`);
  const npc = db.characters[position] as character;
  npc.scriptstate = { ...(npc.scriptstate || {}), ...state };
  rt.database.setCharacterByIndex(position, npc);
}

export async function importRisuPreset(name: string, data: Uint8Array) {
  const rt = await runtime();
  await rt.database.importPreset({ name, data });
  const db = rt.database.getDatabase();
  if (!db.botPresets.length) return;
  db.botPresetsId = db.botPresets.length - 1;
  rt.database.changeToPreset(db.botPresetsId, false);
}

function format(value: FeliniaProvider['format']): number {
  if (value === 'responses') return LLMFormat.OpenAIResponseAPI;
  if (value === 'anthropic') return LLMFormat.Anthropic;
  if (value === 'gemini') return LLMFormat.GoogleCloud;
  if (value === 'mistral') return LLMFormat.Mistral;
  if (value === 'ollama') return LLMFormat.Ollama;
  return LLMFormat.OpenAICompatible;
}

export async function configureFeliniaProvider(provider: FeliniaProvider) {
  const rt = await runtime();
  const db = rt.database.getDatabase();
  db.aiModel = 'reverse_proxy';
  db.proxyRequestModel = 'custom';
  db.customProxyRequestModel = provider.model;
  db.forceReplaceUrl = provider.base;
  db.proxyKey = provider.key || '';
  db.customAPIFormat = format(provider.format);
  // Empty fields in FELINIA mean "use the endpoint default". -1000 is Risu's
  // existing sentinel for omitting a sampling parameter from the request.
  db.temperature = provider.temperature == null ? -1000 : Math.round(provider.temperature * 100);
  db.top_p = provider.topP == null ? -1000 : provider.topP;
  /* Match Risu's native default: 0 is low reasoning. Players can still choose
   * -1 explicitly to disable/minimize it for very small or latency-sensitive models. */
  db.reasoningEffort = provider.reasoningEffort ?? 0;
  db.maxResponse = provider.maxTokens ?? 4096;
  db.maxContext = provider.contextTokens ?? 65536;
  db.useStreaming = provider.stream ?? true;
  db.autofillRequestUrl = provider.autofillRequestUrl ?? true;
  // FELINIA is a static browser game and deliberately ships no proxy server.
  // Route requests straight to the endpoint configured by the player.
  db.usePlainFetch = true;
  // Custom browser endpoints (including Gemini CLI bridges) often implement only
  // the common OpenAI chat-completions subset. Keep Risu's prompt engine while
  // using a deliberately conservative transport payload.
  db.strictOpenAICompatible = provider.format === 'openai' || !provider.format;
  db.inlayErrorResponse = true;
}

function generationError(chat: Chat, startLength: number): string {
  const added = chat.message.slice(startLength);
  const errorMessage = [...added].reverse().find((message) =>
    message.role === 'char' && /```risuerror\b/i.test(message.data || '')
  );
  if (!errorMessage) return '';
  chat.message = chat.message.slice(0, startLength);
  return String(errorMessage.data || '')
    .replace(/^```risuerror\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

/** Removes provider reasoning from every FELINIA-facing surface. Risu's UI knows
 * how to render <Thoughts> separately, but the fixed headless host receives the
 * raw message text and must never stream, persist, count or feed it back. */
export function stripFeliniaReasoning(text: string): string {
  return String(text || '')
    .replace(/<\s*felinia_state\b[^>]*>[\s\S]*?<\s*\/\s*felinia_state\s*>/gi, '')
    .replace(/<\s*(think|thoughts?|analysis|reasoning)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/```(?:analysis|reasoning|think|thoughts?)\b[^\n]*\n[\s\S]*?```/gi, '')
    /* During streaming the closing tag/fence may not have arrived yet. Hide the
     * unfinished block from its opening marker through the current tail. */
    .replace(/<\s*felinia_state\b[^>]*>[\s\S]*$/gi, '')
    .replace(/<\s*(think|thoughts?|analysis|reasoning)\b[^>]*>[\s\S]*$/gi, '')
    .replace(/```(?:analysis|reasoning|think|thoughts?)\b[^\n]*\n[\s\S]*$/gi, '')
    .trim();
}

function cognitionText(value: unknown, limit: number): string {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

/** Accepts only a small inert data shape. Model-written markup, unknown fields,
 * and oversized values never reach the next prompt or a save. */
export function normalizeFeliniaCognition(value: unknown): FeliniaCognition | null {
  let source = value;
  if (typeof source === 'string') {
    try { source = JSON.parse(source); } catch { return null; }
  }
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null;
  const input = source as Record<string, unknown>;
  const out: FeliniaCognition = { v: 1 };
  const beat = cognitionText(input.beat, 180);
  const focus = cognitionText(input.focus, 60);
  if (beat) out.beat = beat;
  if (focus) out.focus = focus;
  if (Array.isArray(input.characters)) {
    const characters = input.characters.slice(0, 6).flatMap((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
      const item = entry as Record<string, unknown>;
      const name = cognitionText(item.name, 40);
      if (!name) return [];
      const character: FeliniaCognitionCharacter = { name };
      for (const key of ['knows', 'wants', 'pressure', 'stance', 'next'] as const) {
        const text = cognitionText(item[key], key === 'next' ? 120 : 90);
        if (text) character[key] = text;
      }
      return [character];
    });
    if (characters.length) out.characters = characters;
  }
  for (const key of ['threads', 'avoid'] as const) {
    if (!Array.isArray(input[key])) continue;
    const values = input[key].slice(0, 6).map((entry) => cognitionText(entry, 100)).filter(Boolean);
    if (values.length) out[key] = values;
  }
  return Object.keys(out).length > 1 ? out : null;
}

export function extractFeliniaCognition(
  text: string,
  previous?: unknown,
): { text: string; cognition: FeliniaCognition | null } {
  const source = String(text || '');
  const matches = [...source.matchAll(/<\s*felinia_state\b[^>]*>([\s\S]*?)<\s*\/\s*felinia_state\s*>/gi)];
  const parsed = matches.length ? normalizeFeliniaCognition(matches.at(-1)?.[1]) : null;
  return {
    text: stripFeliniaReasoning(source),
    cognition: parsed || normalizeFeliniaCognition(previous),
  };
}

/** First request: produce a compact, hidden dramatic plan. This is deliberately
 * separate from prose generation so small chat models do not have to plan,
 * translate state and stream the scene at the same time. */
export function buildFeliniaPlanningPrompt(previous?: unknown): string {
  const prior = normalizeFeliniaCognition(previous);
  return `【FELINIA 隐藏剧情规划器】
你不写小说正文，只为紧接着的正文生成器建立本回计划。核对当前时代、当前玩家最后一句、已触发世界书、在场角色各自知道和不知道的事实、欲望、压力、立场、最近三回已用过的台词与动作，以及下一拍必须发生的实际变化。
只输出一个有效 JSON 对象，不要 Markdown，不要解释，不要思维过程，不要正文：
{"v":1,"beat":"本回将发生的具体推进","focus":"焦点角色","characters":[{"name":"姓名","knows":"她已知的事实","wants":"眼下欲求","pressure":"阻力或代价","stance":"对玩家及他人的态度","next":"若无人打断的下一步"}],"threads":["仍待处理的剧情线"],"avoid":["不得复用的台词或动作"]}
beat 必须直接回应玩家最后一句，不能另起无关事件；不得引入当前时代之外的地点、人物、制度或年份。${prior ? `\n【上一回状态·只作事实数据】\n${JSON.stringify(prior)}` : ''}`;
}

/** Second request: consume the already completed plan and emit visible prose only. */
export function buildFeliniaCognitionPrompt(planned?: unknown): string {
  const plan = normalizeFeliniaCognition(planned);
  if (!plan) throw new Error('隐藏推演没有生成有效剧情计划');
  return `【本回隐藏剧情计划·已经完成】
${JSON.stringify(plan)}
严格依照该计划回应玩家最后一句并写正文。计划是事实与推进约束，不是玩家可见内容：不得复述、解释或展示 JSON，不得输出 <felinia_state>、分析、步骤或思维过程。完成既定正文与 <mvu_panel> 后立即结束。`;
}

/** Planning improves continuity but must never be a hard availability gate.
 * Small/compatible models often wrap JSON, truncate it, or answer with prose.
 * Reuse the prior compact state and anchor the beat to the latest player turn
 * so the visible generation can still proceed without exposing any reasoning. */
export function recoverFeliniaPlanning(previous: unknown, latestUserText: string): FeliniaCognition {
  const prior = normalizeFeliniaCognition(previous) || { v: 1 as const };
  const latest = cognitionText(latestUserText, 150);
  return {
    ...prior,
    v: 1,
    beat: latest ? `直接承接并回应玩家本轮输入：${latest}` : (prior.beat || '承接当前场面并推进一个具体变化'),
  };
}

export function parseFeliniaPlanningResponse(text: string): FeliniaCognition | null {
  const clean = stripFeliniaReasoning(String(text || '')).replace(/```(?:json)?|```/gi, '').trim();
  const direct = normalizeFeliniaCognition(clean);
  if (direct) return direct;
  const first = clean.indexOf('{');
  const last = clean.lastIndexOf('}');
  return first >= 0 && last > first ? normalizeFeliniaCognition(clean.slice(first, last + 1)) : null;
}

function proseCharacters(text: string): number {
  return stripFeliniaReasoning(text)
    .replace(/<mvu_panel>[\s\S]*?<\/mvu_panel>/gi, '')
    .trim().length;
}

function dialogueUnits(text: string): Array<{ raw: string; key: string }> {
  const units: Array<{ raw: string; key: string }> = [];
  for (const quote of String(text || '').matchAll(/「([^」\n]{2,180})」/g)) {
    for (const rawPart of quote[1].split(/[。！？!?]+/)) {
      const raw = rawPart.trim();
      const key = raw
        .replace(/\s+/g, '')
        .replace(/[，、：；…—―~～♡]+$/g, '')
        .replace(/喵(?:呜|嗷|咪)?[~～♡]*$/u, '');
      if (key.length >= 3) units.push({ raw, key });
    }
  }
  return units;
}

/** Returns full dialogue fragments repeated verbatim from recent assistant turns.
 * Cat suffixes and terminal punctuation are ignored so “不知道喵” and
 * “不知道喵。” are treated as the same line. */
export function findRepeatedFeliniaDialogue(text: string, previousAssistantTexts: string[]): string[] {
  const previous = new Set(previousAssistantTexts.flatMap((entry) => dialogueUnits(entry).map((unit) => unit.key)));
  return [...new Set(dialogueUnits(text).filter((unit) => previous.has(unit.key)).map((unit) => unit.raw))];
}

export function risuMessage(turn: FeliniaTurn): Message {
  const assistant = turn.role === 'assistant' || turn.role === 'char';
  return {
    role: assistant ? 'char' : 'user',
    data: assistant ? stripFeliniaReasoning(turn.content) : String(turn.content || ''),
    scanData: turn.scanContent == null ? undefined
      : (assistant ? stripFeliniaReasoning(turn.scanContent) : String(turn.scanContent)),
    name: turn.name,
    chatId: turn.chatId || (Number.isFinite(turn.memoryIndex) ? `felinia-turn:${turn.memoryIndex}` : undefined),
    time: turn.time ?? Date.now(),
  };
}

export async function setFeliniaHistory(turns: FeliniaTurn[]) {
  const rt = await runtime();
  const current = rt.database.getCurrentCharacter();
  if (!current || current.type === 'group') throw new Error('No FELINIA era is active');
  current.chats[current.chatPage].message = turns.filter((turn) => turn.role !== 'system').map(risuMessage);
  rt.database.setCurrentCharacter(current);
}

export async function getFeliniaHistory(): Promise<FeliniaTurn[]> {
  const rt = await runtime();
  const current = rt.database.getCurrentCharacter();
  if (!current || current.type === 'group') return [];
  return current.chats[current.chatPage].message.map((message, index) => ({
    role: message.role === 'char' ? 'assistant' : 'user',
    content: message.role === 'char' ? stripFeliniaReasoning(message.data) : message.data,
    name: message.name,
    chatId: message.chatId,
    time: message.time,
    memoryIndex: /^felinia-turn:-?\d+$/.test(String(message.chatId || ''))
      ? Number(String(message.chatId).slice('felinia-turn:'.length))
      : index,
  }));
}

export async function generateFeliniaTurn(options: FeliniaGenerateOptions = {}) {
  const rt = await runtime();
  if (options.provider) await configureFeliniaProvider(options.provider);
  const current = rt.database.getCurrentCharacter();
  if (!current || current.type === 'group') throw new Error('No FELINIA era is active');
  const currentChat = current.chats[current.chatPage];
  const startLength = currentChat.message.length;
  const originalSystemPrompt = current.systemPrompt;
  const runtimeMeta = meta(current);
  const palaceOptions = runtimeMeta ? {
    enabled: runtimeMeta.palaceEnabled === true,
    sessionId: runtimeMeta.palaceSessionId || '',
    eraIndex: runtimeMeta.eraIndex,
    history: await getFeliniaHistory(),
    opening: current.firstMessage || '',
    budgetChars: runtimeMeta.palaceBudgetChars || 3000,
    topK: runtimeMeta.palaceTopK || 8,
    gpu: runtimeMeta.palaceGpu !== false,
    vectors: runtimeMeta.palaceVectors !== false,
  } : undefined;
  const palaceRecall = palaceOptions
    ? await prepareFeliniaPalace(palaceOptions)
    : { text: '', drawerIds: [], source: 'disabled' as const };
  /* Palace is primary. HypaV3 still runs and updates its own independent index;
   * the native pipeline suppresses only its duplicate prompt when this recall is
   * non-empty, then automatically becomes the fallback on an empty/error result. */
  if (runtimeMeta) {
    runtimeMeta.palaceRecallActive = palaceRecall.source === 'palace' && !!palaceRecall.text;
    current.extentions!.felinia = runtimeMeta;
  }
  options.onPhase?.('planning');
  const loreResult = await (await import('../ts/process/lorebook.svelte')).loadLoreBookV3Prompt();
  const activeLore = loreResult.actives.map((entry) => entry.prompt).filter(Boolean).join('\n\n');
  const planningContext = [
    originalSystemPrompt,
    current.desc ? `【当前角色与时代资料】\n${current.desc}` : '',
    current.personality ? `【当前人物性格】\n${current.personality}` : '',
    current.scenario ? `【当前场景】\n${current.scenario}` : '',
    current.replaceGlobalNote ? `【落笔后置规则】\n${current.replaceGlobalNote}` : '',
    activeLore ? `【本回实际触发的世界书】\n${activeLore}` : '',
    palaceRecall.text,
    buildFeliniaPlanningPrompt(options.cognition),
  ].filter(Boolean).join('\n\n');
  const planningMessages: FeliniaAuxRequestOptions['messages'] = [
    { role: 'system', content: planningContext },
    ...currentChat.message.slice(-10).map((message) => ({
      role: message.role === 'char' ? 'assistant' as const : 'user' as const,
      content: message.role === 'char'
        ? stripFeliniaReasoning(message.data)
        : String(message.data || ''),
      name: message.name,
    })),
  ];
  const latestUserText = [...currentChat.message].reverse()
    .find((message) => message.role !== 'char')?.data || '';
  let plannedCognition: FeliniaCognition | null = null;
  try {
    const planningResponse = await requestFeliniaAux({
      messages: planningMessages,
      signal: options.signal,
      maxTokens: 700,
    });
    plannedCognition = parseFeliniaPlanningResponse(planningResponse.text);
  } catch (error) {
    if (options.signal?.aborted) throw error;
  }
  if (!plannedCognition) plannedCognition = recoverFeliniaPlanning(options.cognition, latestUserText);
  options.onPhase?.('writing');
  const cognitionPrompt = buildFeliniaCognitionPrompt(plannedCognition);
  const generationSystemPrompt = palaceRecall.text
    ? `${originalSystemPrompt}\n\n${palaceRecall.text}\n\n${cognitionPrompt}`
    : `${originalSystemPrompt}\n\n${cognitionPrompt}`;
  current.systemPrompt = generationSystemPrompt;
  rt.database.setCurrentCharacter(current);
  const minChars = Math.max(0, Math.round(options.minChars || 0));
  const maxShortRetries = Math.max(0, Math.min(1, Math.round(options.maxShortRetries ?? 1)));
  const maxRetries = Math.max(1, maxShortRetries);
  const previousAssistantTexts = currentChat.message.slice(0, startLength)
    .filter((message) => message.role === 'char').slice(-3)
    .map((message) => stripFeliniaReasoning(message.data));
  // The original visual client releases this store after awaiting sendChat.
  // The headless host owns that lifecycle now, including recovery after errors.
  rt.process.doingChat.set(false);
  let previous = stripFeliniaReasoning(current.chats[current.chatPage].message.at(-1)?.data || '');
  let timer: ReturnType<typeof setInterval> | undefined;
  if (options.onDelta) {
    timer = setInterval(() => {
      const message = rt.database.getCurrentChat()?.message.at(-1);
      if (message?.role !== 'char') return;
      const visible = stripFeliniaReasoning(message.data);
      if (visible === previous) return;
      previous = visible;
      options.onDelta?.(previous);
    }, 50);
  }
  try {
    type Candidate = { message: Message; cognition: FeliniaCognition | null };
    let bestCandidate: Candidate | undefined;
    let fallbackCandidate: Candidate | undefined;
    let chosenCognition = plannedCognition;
    let retryInstruction = '';
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        currentChat.message = currentChat.message.slice(0, startLength);
        current.systemPrompt = `${generationSystemPrompt}\n\n${retryInstruction}`;
        rt.database.setCurrentCharacter(current);
        previous = stripFeliniaReasoning(currentChat.message.at(-1)?.data || '');
      }
      rt.process.doingChat.set(false);
      const ok = await rt.process.sendChat(-1, {
        signal: options.signal,
        preview: options.preview,
      });
      if (!ok) {
        const message = generationError(currentChat, startLength) || '生成请求失败';
        const recovered = bestCandidate || fallbackCandidate;
        if (!recovered) throw new Error(message);
        currentChat.message.push(clone(recovered.message));
        chosenCognition = recovered.cognition;
        break;
      }
      if (options.preview) break;
      const generated = currentChat.message.at(-1);
      if (!generated || generated.role !== 'char') continue;
      const extracted = extractFeliniaCognition(generated.data, plannedCognition);
      generated.data = extracted.text;
      const candidate: Candidate = { message: clone(generated), cognition: extracted.cognition };
      chosenCognition = extracted.cognition;
      if (!fallbackCandidate || proseCharacters(generated.data) > proseCharacters(fallbackCandidate.message.data)) {
        fallbackCandidate = candidate;
      }
      const repeated = findRepeatedFeliniaDialogue(generated.data, previousAssistantTexts);
      if (!repeated.length && (!bestCandidate || proseCharacters(generated.data) > proseCharacters(bestCandidate.message.data))) {
        bestCandidate = candidate;
      }
      const tooShort = !!minChars && proseCharacters(generated.data) < minChars;
      if (!repeated.length && !tooShort) break;
      if (attempt === maxRetries) {
        const recovered = bestCandidate || fallbackCandidate;
        if (recovered) {
          currentChat.message[currentChat.message.length - 1] = clone(recovered.message);
          chosenCognition = recovered.cognition;
        }
        break;
      }
      retryInstruction = repeated.length
        ? `【对白复读纠正】刚才草稿复用了最近三回已经说过的台词：${repeated.map((line) => `「${line}」`).join('、')}。该草稿作废。保持人物全部设定与当前场景，从本回开头重写；这些句子及同义的万能推脱都不得再次出现。根据眼前对象、动作和利害写出新的回应，也可以用沉默、追问、改口或具体行动代替。`
        : `【篇幅纠正】刚才草稿的正文不足 ${minChars} 字，已经作废。保持同一场景从头重写；状态栏不计入字数，正文达到 ${minChars} 字后才能结束。用事件、反应、对话和具体动作扩展，不要总结或赶结局。`;
    }
    if (options.preview) return {
      text: JSON.stringify(rt.process.previewFormated),
      prompt: clone(rt.process.previewFormated),
      history: await getFeliniaHistory(),
    };
    const message = rt.database.getCurrentChat()?.message.at(-1);
    if (message?.role === 'char') message.data = stripFeliniaReasoning(message.data);
    if (!message || message.role !== 'char' || !String(message.data || '').trim()) {
      throw new Error('接口没有返回可显示的正文');
    }
    options.onDelta?.(message.data);
    rt.database.setCurrentCharacter(current);
    const history = await getFeliniaHistory();
    if (palaceOptions) {
      try {
        await syncFeliniaPalace({ ...palaceOptions, history });
      } catch (error) {
        console.warn('[FELINIA memory] palace write failed; Risu memory remains active', error);
      }
    }
    return { text: message.data, history, cognition: chosenCognition };
  } finally {
    current.systemPrompt = originalSystemPrompt;
    if (runtimeMeta) {
      runtimeMeta.palaceRecallActive = false;
      current.extentions!.felinia = runtimeMeta;
    }
    rt.database.setCurrentCharacter(current);
    if (timer) clearInterval(timer);
    rt.process.doingChat.set(false);
  }
}

export async function requestFeliniaAux(options: FeliniaAuxRequestOptions) {
  const rt = await runtime();
  if (options.provider) await configureFeliniaProvider(options.provider);
  const request = await import('../ts/process/request/request');
  const current = rt.database.getCurrentCharacter();
  if (!current || current.type === 'group') throw new Error('No FELINIA era is active');
  const response = await request.requestChatData({
    formated: options.messages,
    currentChar: current,
    useStreaming: !!options.onDelta,
    forceStreaming: !!options.onDelta,
    maxTokens: options.maxTokens,
    staticModel: 'reverse_proxy',
    bias: {},
    biasString: [],
  }, 'otherAx', options.signal);
  if (response.type === 'fail') throw new Error(response.result);
  if (response.type === 'streaming') {
    const reader = response.result.getReader();
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (value) {
        const key = Object.keys(value)[0];
        if (key) text = value[key] ?? text;
        options.onDelta?.(stripFeliniaReasoning(text));
      }
      if (done) break;
    }
    return { text: stripFeliniaReasoning(text) };
  }
  if (response.type === 'multiline') return { text: stripFeliniaReasoning(response.result.join('\n')) };
  return { text: stripFeliniaReasoning(response.result) };
}

export async function listFeliniaModels(provider: FeliniaProvider) {
  const rt = await runtime();
  const url = `${provider.base.replace(/\/$/, '').replace(/\/(chat\/completions|responses)$/i, '')}/models`;
  const response = await rt.globalApi.globalFetch(url, {
    method: 'GET',
    headers: provider.key ? { Authorization: `Bearer ${provider.key}` } : {},
    plainFetchForce: true,
  });
  if (!response.ok) throw new Error(typeof response.data === 'string' ? response.data : `HTTP ${response.status}`);
  const rows = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data?.models) ? response.data.models : []);
  return rows.map((entry: any) => String(entry?.id || entry?.name || '')).filter(Boolean);
}

export async function processFeliniaDisplay(text: string) {
  const rt = await runtime();
  const current = rt.database.getCurrentCharacter();
  return current ? rt.scripts.processScript(current, text, 'editdisplay') : text;
}

export async function snapshotFeliniaRisu(): Promise<Database> {
  return (await runtime()).database.getDatabase({ snapshot: true });
}

export async function restoreFeliniaRisu(snapshot: Database) {
  const rt = await runtime();
  rt.database.setDatabase(snapshot);
  const selected = snapshot.characters.findIndex((entry) => entry.type !== 'group' && meta(entry)?.kind === 'era');
  rt.stores.selectedCharID.set(selected);
}

export async function resetFeliniaRisu() {
  const rt = await runtime();
  rt.database.setDatabase(emptyDatabase() as Database);
  rt.stores.selectedCharID.set(-1);
}

export const FeliniaRisu = Object.freeze({
  version: '2026.8.250',
  upstreamCommit: 'e565563a288ebe4c65b6099a1645ba477d1c84b4',
  install: installFeliniaGame,
  installContent: installFeliniaContent,
  compileDefinition: compileFeliniaDefinition,
  activateEra: activateFeliniaEra,
  setSessionContent: setFeliniaSessionContent,
  configureMemory: configureFeliniaMemory,
  configureTranslation: configureFeliniaTranslation,
  translate: translateFelinia,
  setNpcState: setFeliniaNpcState,
  importPreset: importRisuPreset,
  configureProvider: configureFeliniaProvider,
  setHistory: setFeliniaHistory,
  getHistory: getFeliniaHistory,
  generate: generateFeliniaTurn,
  request: requestFeliniaAux,
  listModels: listFeliniaModels,
  processDisplay: processFeliniaDisplay,
  preparePalace: prepareFeliniaPalace,
  syncPalace: syncFeliniaPalace,
  exportPalace: exportFeliniaPalace,
  importPalace: importFeliniaPalace,
  clearPalace: clearFeliniaPalace,
  snapshot: snapshotFeliniaRisu,
  restore: restoreFeliniaRisu,
  reset: resetFeliniaRisu,
});
