import { describe, expect, it } from 'vitest';
import {
  buildFeliniaPalaceDrawers,
  clearFeliniaPalace,
  feliniaPalaceLexicalScore,
  getFeliniaPalaceDrawers,
  syncFeliniaPalace,
} from './feliniaPalace';

describe('FELINIA browser palace memory', () => {
  it('keeps completed visible turns verbatim and leaves the pending user turn out', () => {
    const drawers = buildFeliniaPalaceDrawers([
      { role: 'user', content: '我把铜钥匙交给阿禾。', memoryIndex: 1, time: 10 },
      {
        role: 'assistant',
        content: '<Thoughts>不能保存</Thoughts>\n阿禾把铜钥匙系在腰间。\n\n<mvu_panel>状态</mvu_panel>',
        memoryIndex: 2,
        time: 11,
      },
      { role: 'user', content: '我问她钥匙还在不在。', memoryIndex: 3, time: 12 },
    ], 6, '港口的风贴着石阶过去。');

    expect(drawers).toHaveLength(2);
    expect(drawers[0].turn).toBe(-1);
    expect(drawers[1].turn).toBe(2);
    expect(drawers[1].content).toContain('我把铜钥匙交给阿禾。');
    expect(drawers[1].content).toContain('阿禾把铜钥匙系在腰间。');
    expect(drawers[1].content).not.toContain('Thoughts');
    expect(drawers[1].content).not.toContain('mvu_panel');
    expect(drawers.some((drawer) => drawer.content.includes('还在不在'))).toBe(false);
  });

  it('ranks a relevant Chinese past event above an unrelated one without an API', () => {
    const query = '阿禾腰间的铜钥匙还能打开仓门吗？';
    const relevant = feliniaPalaceLexicalScore(query, '阿禾把铜钥匙系在腰间，答应守着仓门。');
    const unrelated = feliniaPalaceLexicalScore(query, '雨后船工把湿麻绳摊在石阶上晾晒。');
    expect(relevant).toBeGreaterThan(unrelated);
    expect(relevant).toBeGreaterThan(0);
  });

  it('returns one save palace to the UI without embedding vectors or other saves', async () => {
    await clearFeliniaPalace();
    await syncFeliniaPalace({
      enabled: true,
      sessionId: 'ui-save-a',
      eraIndex: 8,
      vectors: false,
      opening: '中庭的灯刚刚点亮。',
      history: [
        { role: 'user', content: '我把木牌放在石桌上。', memoryIndex: 1 },
        { role: 'assistant', content: '尼禄看了一眼木牌，没有伸手。', memoryIndex: 1 },
      ],
    });
    await syncFeliniaPalace({
      enabled: true,
      sessionId: 'ui-save-b',
      eraIndex: 9,
      vectors: false,
      history: [
        { role: 'user', content: '另一份存档。', memoryIndex: 1 },
        { role: 'assistant', content: '不应出现。', memoryIndex: 1 },
      ],
    });

    const drawers = await getFeliniaPalaceDrawers('ui-save-a');
    expect(drawers).toHaveLength(2);
    expect(drawers[1].content).toContain('我把木牌放在石桌上。');
    expect(drawers[1].content).toContain('尼禄看了一眼木牌');
    expect(drawers.some((drawer) => drawer.content.includes('另一份存档'))).toBe(false);
    expect(drawers.every((drawer) => !('vector' in drawer))).toBe(true);
    await clearFeliniaPalace();
  });
});
