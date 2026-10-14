import test from 'node:test';
import assert from 'node:assert/strict';
import { THEMES } from '../src/config/themes.js';
import { decorationProps, stickerProps } from '../src/config/decorations.js';
import { readFileSync, readdirSync } from 'node:fs';
import { textureVariables } from '../src/config/textures.js';

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

test('every configured sticker and doodle has a safe lightweight local SVG', () => {
  const materials = new Set();
  for (const theme of THEMES) {
    const quote = theme.decorations.quoteDecorationStyle;
    assert.equal(Object.keys(theme.decorations.doodles).length, 4);
    for (const material of [theme.decorations.primarySticker, quote.sticker, quote.doodle, theme.decorations.progressCardDecoration, theme.decorations.tape, ...Object.values(theme.decorations.doodles)]) {
      const svg = readFileSync(`public/${material.asset}`, 'utf8');
      assert.match(svg, /viewBox="0 0 (80 80|120 36)"/);
      assert.doesNotMatch(svg, /<script|<image|<foreignObject|href=|https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
      assert.ok(Buffer.byteLength(svg) < 3000, `${material.asset} stays lightweight`);
      materials.add(material.asset);
    }
  }
  assert.equal(materials.size, 28);
  assert.equal(['cream', 'pink', 'minimal', 'nature'].reduce((sum, folder) => sum + readdirSync(`public/decorations/${folder}`).length, 0), 29);
});

test('missing or unknown decoration materials degrade to the plain theme', () => {
  const plain = { tape: null, sticker: null, progress: null, previewDoodle: null, progressDoodle: null, icon: undefined, quote: null };
  assert.deepEqual(decorationProps(), plain);
  assert.deepEqual(decorationProps({ tape: { style: 'missing-image.webp' }, primarySticker: { shape: 'unknown' }, sectionIconStyle: 'unknown', quoteDecorationStyle: { style: 'unknown' } }), plain);
  assert.equal(stickerProps(null), null);
  assert.deepEqual(stickerProps({ shape: 'leaf', color: 'url(missing.webp)' }), { shape: 'leaf', color: 'currentColor' });
});

test('four subtle CSS texture families, no external resources and safe plain fallback', () => {
  const families = new Set();
  for (const theme of THEMES) {
    const vars = textureVariables(theme.decorations.texture);
    assert.notEqual(vars['--journal-texture-image'], 'none');
    assert.doesNotMatch(vars['--journal-texture-image'], /url\(|https?:|NaN/);
    let depth = 0, layers = 1;
    for (const char of vars['--journal-texture-image']) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (char === ',' && depth === 0) layers++;
    }
    assert.equal(layers, vars['--journal-texture-size'].split(',').length);
    families.add(theme.decorations.texture.primaryType);
    assert.ok(theme.decorations.texture.opacity <= .14);
  }
  assert.equal(families.size, 4);
  assert.equal(textureVariables()['--journal-texture-image'], 'none');
  assert.equal(textureVariables({ primaryType: 'unknown', color: '#123456' })['--journal-texture-image'], 'none');
  assert.equal(textureVariables({ primaryType: 'gingham', color: 'url(remote)' })['--journal-texture-image'], 'none');
  const clamped = textureVariables({ primaryType: 'gingham', color: '#123456', scale: 900, opacity: 900 });
  assert.match(clamped['--journal-texture-image'], /14%/);
  assert.doesNotMatch(clamped['--journal-texture-image'], /900/);
});
