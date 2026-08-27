type RuntimeModule =
  | 'database'
  | 'process'
  | 'request'
  | 'lorebook'
  | 'scripts'
  | 'triggers'
  | 'modules'
  | 'plugins'
  | 'hypaMemoryV3'
  | 'supaMemory'
  | 'characterCards'
  | 'tokenizer'
  | 'parser'
  | 'storage'
  | 'stores'
  | 'prompt'
  | 'translator'
  | 'feliniaGame';

const loaders: Record<RuntimeModule, () => Promise<unknown>> = {
  database: () => import('../ts/storage/database.svelte'),
  process: () => import('../ts/process/index.svelte'),
  request: () => import('../ts/process/request/request'),
  lorebook: () => import('../ts/process/lorebook.svelte'),
  scripts: () => import('../ts/process/scripts'),
  triggers: () => import('../ts/process/triggers'),
  modules: () => import('../ts/process/modules'),
  plugins: () => import('../ts/plugins/plugins.svelte'),
  hypaMemoryV3: () => import('../ts/process/memory/hypav3'),
  supaMemory: () => import('../ts/process/memory/supaMemory'),
  characterCards: () => import('../ts/characterCards'),
  tokenizer: () => import('../ts/tokenizer'),
  parser: () => import('../ts/parser/parser.svelte'),
  storage: () => import('../ts/storage/autoStorage'),
  stores: () => import('../ts/stores.svelte'),
  prompt: () => import('../ts/process/prompt'),
  translator: () => import('../ts/translator/translator'),
  feliniaGame: () => import('./feliniaGame'),
};

const loaded = new Map<RuntimeModule, Promise<unknown>>();

function load<T = Record<string, unknown>>(name: RuntimeModule): Promise<T> {
  const cached = loaded.get(name);
  if (cached) return cached as Promise<T>;
  const promise = loaders[name]();
  loaded.set(name, promise);
  return promise as Promise<T>;
}

async function preload(names: RuntimeModule[]) {
  await Promise.all(names.map((name) => load(name)));
}

const api = Object.freeze({
  version: '2026.8.250',
  upstreamCommit: 'e565563a288ebe4c65b6099a1645ba477d1c84b4',
  load,
  preload,
  modules: Object.freeze(Object.keys(loaders) as RuntimeModule[]),
});

declare global {
  interface Window {
    RisuHeadless?: typeof api;
  }
}

if (typeof window !== 'undefined') {
  window.RisuHeadless = api;
  window.dispatchEvent(new CustomEvent('risu-headless-ready', { detail: api }));
}

export default api;
