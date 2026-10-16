import test from 'node:test';
import assert from 'node:assert/strict';
import { focusScrollTop, visibleViewport } from '../src/hooks/useModalViewport.js';

test('uses the visual viewport height and pan offset, with a no-API fallback', () => {
  assert.deepEqual(visibleViewport({ height: 430, offsetTop: 80 }, 844), { height: 430, top: 80 });
  assert.deepEqual(visibleViewport(undefined, 844), { height: 844, top: 0 });
  assert.deepEqual(visibleViewport({ height: 0, offsetTop: -1 }, 844), { height: 844, top: 0 });
});

test('centers obscured inputs in the scrollable body, excluding the sticky actions', () => {
  const base = { viewportTop: 100, viewportBottom: 400, height: 48, scrollTop: 100, maxScroll: 600 };
  assert.equal(focusScrollTop({ ...base, top: 130, bottom: 178 }), 100);
  assert.equal(focusScrollTop({ ...base, top: 500, bottom: 548 }), 374);
  assert.equal(focusScrollTop({ ...base, top: 40, bottom: 88 }), 0);
  assert.equal(focusScrollTop({ ...base, top: 1200, bottom: 1248 }), 600);
  assert.equal(focusScrollTop({ ...base, top: 420, bottom: 920, height: 500 }), 420);
});
