import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { THEMES } from '../src/config/themes.js';
import { CUP_GEOMETRY, cupType, cupVisualPercent, fluidOffset } from '../src/features/hydration/cupGeometry.js';

test('four themes provide distinct cup renderers and local, existing artwork', () => {
  assert.deepEqual(THEMES.map(t => t.hydrationCup.type), ['tumbler', 'boba', 'coffee', 'mug']);
  for (const { hydrationCup: c } of THEMES) {
    for (const key of ['bodyColor', 'bodySecondaryColor', 'rimColor', 'lidColor', 'handleColor', 'strawColor', 'accentColor', 'waterColor', 'outlineColor']) {
      assert.match(c[key], /^#[\da-f]{6}$/i);
    }
    for (const material of [c.sticker, c.secondaryDecoration, c.completion]) {
      if (!material.asset) continue;
      assert.match(material.asset, /^decorations\/[a-z/-]+\.svg$/);
      assert.ok(existsSync(new URL(`../public/${material.asset}`, import.meta.url)));
    }
  }
  assert.equal(THEMES[1].hydrationCup.pearls.count, 9);
});

test('all cup geometries share exact progress, empty/full bounds and overflow cap', () => {
  for (const g of Object.values(CUP_GEOMETRY)) {
    assert.ok(g.top < g.bottom);
    assert.equal(fluidOffset(0, g), g.bottom);
    assert.equal(fluidOffset(100, g), g.top);
    for (const total of [0, 600, 1200, 1800, 2200, 2400]) {
      const percent = cupVisualPercent(total, 2200);
      assert.equal(percent, Math.min(100, total / 2200 * 100));
      assert.equal(fluidOffset(percent, g), g.bottom - (g.bottom - g.top) * percent / 100);
    }
    assert.equal(fluidOffset(NaN, g), g.bottom);
    assert.equal(fluidOffset(-10, g), g.bottom);
    assert.equal(fluidOffset(200, g), g.top);
  }
});

test('visual helpers handle changed goals and invalid configuration safely', () => {
  assert.equal(cupVisualPercent(1200, 2400), 50);
  assert.equal(cupVisualPercent(3000, 2400), 100);
  for (const [amount, goal] of [[-1,2200],[NaN,2200],[Infinity,2200],[1200,0],[1200,NaN]]) {
    assert.equal(cupVisualPercent(amount, goal), 0);
  }
  for (const value of [undefined, null, 'unknown', 'constructor', '__proto__']) assert.equal(cupType(value), 'mug');
});
