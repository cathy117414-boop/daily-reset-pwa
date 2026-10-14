import test from 'node:test';
import assert from 'node:assert/strict';
import { THEMES } from '../src/config/themes.js';
import { decorationProps, stickerProps } from '../src/config/decorations.js';

test('all four themes configure each phase-one decoration', () => {
  for (const theme of THEMES) {
    const result = decorationProps(theme.decorations);
    for (const field of ['tape', 'sticker', 'progress', 'icon', 'quote']) assert.ok(result[field], `${theme.id}.${field}`);
    assert.ok(result.quote.doodle);
  }
});

test('missing or unknown decoration materials degrade to the plain theme', () => {
  const plain = { tape: null, sticker: null, progress: null, icon: undefined, quote: null };
  assert.deepEqual(decorationProps(), plain);
  assert.deepEqual(decorationProps({ tape: { style: 'missing-image.webp' }, primarySticker: { shape: 'unknown' }, sectionIconStyle: 'unknown', quoteDecorationStyle: { style: 'unknown' } }), plain);
  assert.equal(stickerProps(null), null);
  assert.deepEqual(stickerProps({ shape: 'leaf', color: 'url(missing.webp)' }), { shape: 'leaf', color: 'currentColor' });
});
