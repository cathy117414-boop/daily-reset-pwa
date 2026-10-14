import test from 'node:test';
import assert from 'node:assert/strict';
import { THEMES } from '../src/config/themes.js';
import { decorationProps, stickerProps } from '../src/config/decorations.js';
import { readFileSync, readdirSync } from 'node:fs';

test('all four themes configure each phase-one decoration', () => {
  for (const theme of THEMES) {
    const result = decorationProps(theme.decorations);
    for (const field of ['tape', 'sticker', 'progress', 'icon', 'quote']) assert.ok(result[field], `${theme.id}.${field}`);
    assert.ok(result.quote.doodle);
    assert.ok(result.quote.sticker);
  }
});

test('local sticker material paths and sizes are constrained, retaining legacy shapes', () => {
  assert.deepEqual(stickerProps({ asset: 'decorations/pink/bow.svg', size: 500 }), { asset: 'decorations/pink/bow.svg', size: 48 });
  assert.deepEqual(stickerProps({ asset: 'decorations/pink/bow.svg', size: -1 }), { asset: 'decorations/pink/bow.svg', size: 12 });
  assert.equal(stickerProps({ asset: 'https://example.com/bow.svg' }), null);
  assert.equal(stickerProps({ asset: 'decorations/pink/../../bow.svg' }), null);
  assert.equal(stickerProps({ asset: 'decorations/pink/bow.svg?external=1' }), null);
  assert.deepEqual(stickerProps({ shape: 'heart', color: '#C96F8D' }), { shape: 'heart', color: '#C96F8D' });
  const legacy = decorationProps({ quoteDecorationStyle: { style: 'slender', doodle: 'heart', color: '#C96F8D' } });
  assert.equal(legacy.quote.doodle.shape, 'heart');
});

test('each theme has two local transparent SVG decorations and a tape asset', () => {
  const materials = new Set();
  for (const theme of THEMES) {
    const quote = theme.decorations.quoteDecorationStyle;
    for (const material of [quote.sticker, quote.doodle, theme.decorations.progressCardDecoration, theme.decorations.tape]) {
      const svg = readFileSync(`public/${material.asset}`, 'utf8');
      assert.match(svg, /viewBox="0 0 (80 80|120 36)"/);
      assert.doesNotMatch(svg, /<script|<image|<foreignObject|href=|https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
      assert.ok(Buffer.byteLength(svg) < 3000, `${material.asset} stays lightweight`);
      materials.add(material.asset);
    }
  }
  assert.equal(materials.size, 12);
  for (const folder of ['cream', 'pink', 'minimal', 'nature']) assert.equal(readdirSync(`public/decorations/${folder}`).length, 3);
});

test('missing or unknown decoration materials degrade to the plain theme', () => {
  const plain = { tape: null, sticker: null, progress: null, icon: undefined, quote: null };
  assert.deepEqual(decorationProps(), plain);
  assert.deepEqual(decorationProps({ tape: { style: 'missing-image.webp' }, primarySticker: { shape: 'unknown' }, sectionIconStyle: 'unknown', quoteDecorationStyle: { style: 'unknown' } }), plain);
  assert.equal(stickerProps(null), null);
  assert.deepEqual(stickerProps({ shape: 'leaf', color: 'url(missing.webp)' }), { shape: 'leaf', color: 'currentColor' });
});
