import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyQuoteIndex, getDailyQuote, normalizeLiteraryFavorites, toggleLiteraryFavorite } from '../src/literary.ts';
import { literaryQuotes } from '../src/data/literaryQuotes.ts';
import { loadState, migrateState, saveState } from '../src/storage.js';

test('daily selection survives refresh, advances one slot, handles DST and month/year boundaries', () => {
  for (const [a, b] of [['2026-03-08','2026-03-09'],['2026-11-01','2026-11-02'],['2026-12-31','2027-01-01'],['2028-02-28','2028-02-29']]) {
    assert.equal(getDailyQuote(a).id, getDailyQuote(a).id);
    assert.equal(dailyQuoteIndex(b), (dailyQuoteIndex(a) + 1) % literaryQuotes.length);
  }
  assert.ok(dailyQuoteIndex('2025-01-01') >= 0);
  assert.throws(() => dailyQuoteIndex('2026-02-30'));
  assert.equal(dailyQuoteIndex('2026-01-02', 365), 1);
});

test('favorites persist with old plans and sanitize corrupt or duplicate IDs', () => {
  const id = literaryQuotes[0].id;
  const state = migrateState({version:3, days:{'2026-10-12':{tasks:[{id:'existing'}]}}, literaryFavorites:[id,id,'unknown',null]});
  assert.deepEqual(normalizeLiteraryFavorites(state.literaryFavorites), [id]);
  const values = new Map();
  const storage = {getItem:key => values.get(key) ?? null,setItem:(key,value) => values.set(key,value)};
  saveState(state, storage);
  assert.deepEqual(loadState(storage).literaryFavorites, [id]);
  assert.equal(loadState(storage).days['2026-10-12'].tasks[0].id, 'existing');
  assert.deepEqual(toggleLiteraryFavorite([id], id), []);
  assert.deepEqual(toggleLiteraryFavorite([], id), [id]);
});

test('built-in collection has 30 distinct sourced public-domain entries', () => {
  assert.equal(literaryQuotes.length, 30);
  assert.equal(new Set(literaryQuotes.map(q => q.id)).size, 30);
  for (const quote of literaryQuotes) {
    assert.equal(quote.publicDomain, true);
    assert.ok(quote.quote && quote.author && quote.work && quote.translation && quote.location && quote.sourceUrl);
    assert.ok(quote.year <= 1843);
  }
});
