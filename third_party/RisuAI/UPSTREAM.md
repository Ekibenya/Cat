# RisuAI upstream

- Upstream repository: https://github.com/kwaroran/RisuAI
- Upstream branch: `main`
- Upstream commit: `e565563a288ebe4c65b6099a1645ba477d1c84b4`
- Upstream application version: `2026.8.250`
- Snapshot date: `2026-08-27`
- License: GNU General Public License v3.0

This directory contains the upstream RisuAI source used by the Felinia runtime.
The original RisuAI interface source is intentionally excluded. Felinia supplies
its own interface and only uses the runtime, storage, prompt, lorebook, scripting,
provider, memory, module, parser, tokenizer and platform layers.

The complete upstream history is available from the repository URL and the exact
commit above. The retained source remains governed by the license in `LICENSE`.

## Felinia headless builds

- `pnpm run build:headless` builds the complete lazy-loaded non-interface runtime.
- The deployed output is copied to `core/res/runtime/risu/`. FELINIA installs its
  fixed game data directly as 41 era characters and 590 preset NPC character
  instances. Generation, lorebooks, scripts, triggers, translation, requests,
  memory, prompt assembly, tokenization and persistence remain the upstream
  RisuAI implementations.
- The original tokenizer and Lua runtime resources are retained under `public/`
  and deployed at `/token/` and `/lua/`, matching the paths used by upstream.
- UI and server source are intentionally omitted. There is no secondary FELINIA
  AI core and no user-facing character-card import layer.
