# Interface source excluded from this snapshot

The following upstream paths are intentionally not included because Felinia keeps
its own HTML interface and visual design:

- `src/lib/**`
- `src/App.svelte`
- `src/LiteMain.svelte`
- `src/main.ts`
- `src/preload.ts`
- `src/styles.css`
- Bundled third-party presentation CSS (including the upstream code-highlight theme)
- `src/ts/gui/**`
- `src/ts/setting/**`
- `src/ts/3d/**`
- `src/ts/defaulthotkeys.ts`
- `src/ts/dragTypes.ts`
- `src/ts/hotkey.ts`
- `src/ts/lite.ts`
- `index.html`
- `resources/**`
- RisuAI logos, screenshots, welcome art, samples and other interface-only files
  under `public/**`

Runtime resources under `public/**` that are required by non-interface features
remain included.

Small no-op compatibility shims may occupy an excluded path when the upstream
runtime imports a visual helper from otherwise non-visual processing code. These
shims contain no RisuAI interface implementation or design.
