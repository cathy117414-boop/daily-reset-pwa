import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { addLocalDays, getLocalDateKey, isLocalDateKey } from '../src/dates.js';
import { loadState, migrateState, saveState } from '../src/storage.js';
import { addExtraCare, careForToday, completeCareItem, deleteCareItem, emptySkinCare, isCareDueToday, isCompletedToday, isRoutineToday, normalizeSkinCare, saveCareItem, snoozeCareItemToTomorrow } from '../src/features/skin-care/skinCare.js';

const periodic = (skin = emptySkinCare(), changes = {}, today = '2026-10-15') => saveCareItem(skin, {
  id: 'mask', name: 'Hand Mask', type: 'periodic', frequency: { mode: 'interval', days: 5 }, lastCompletedAt: '2026-10-10', ...changes,
}, today);
const routine = (changes = {}) => saveCareItem(emptySkinCare(), { id: 'face', name: 'Face Care', type: 'routine', frequency: { mode: 'daily' }, ...changes }, '2026-10-15');

test('1: Every 5 days, Last Oct 10 → Next Oct 15', () => {
  const s = periodic();
  assert.equal(s.items[0].nextDueAt, '2026-10-15');
  assert.equal(isCareDueToday(s.items[0], '2026-10-15'), true);
  assert.equal(isCareDueToday(s.items[0], '2026-10-14'), false);
});
test('2: late actual completion Oct 17 starts a new 3-day cycle on Oct 20', () => {
  let s = periodic(undefined, { frequency: { mode: 'interval', days: 3 }, lastCompletedAt: '2026-10-12' });
  assert(isCareDueToday(s.items[0], '2026-10-17'));
  s = completeCareItem(s, 'mask', '2026-10-17');
  assert.equal(s.items[0].lastCompletedAt, '2026-10-17');
  assert.equal(s.items[0].nextDueAt, '2026-10-20');
  assert.equal(careForToday(s, '2026-10-17').due.length, 1); // gentle Done card remains tonight
  assert.equal(careForToday(s, '2026-10-18').due.length, 0);
});
test('3: Tomorrow snoozes, does not complete or change the real cycle', () => {
  const original = periodic();
  let s = snoozeCareItemToTomorrow(original, 'mask', '2026-10-15');
  assert.equal(s.items[0].nextDueAt, '2026-10-15');
  assert.equal(s.items[0].lastCompletedAt, '2026-10-10');
  assert.equal(s.items[0].snoozedUntil, '2026-10-16');
  assert.equal(s.completionLogs.length, 0);
  assert.equal(careForToday(s, '2026-10-15').due.length, 0);
  assert.equal(careForToday(s, '2026-10-16').due.length, 1);
  s = completeCareItem(s, 'mask', '2026-10-17');
  assert.equal(s.items[0].snoozedUntil, null);
  assert.equal(s.items[0].nextDueAt, '2026-10-22');
});
test('4: Just Extra on Oct 17 retains the Oct 20 schedule', () => {
  const s = addExtraCare(periodic(undefined, { lastCompletedAt: '2026-10-15' }), { careId: 'mask', countsAsCompletion: false }, '2026-10-17');
  assert.equal(s.items[0].nextDueAt, '2026-10-20');
  assert.equal(s.items[0].lastCompletedAt, '2026-10-15');
  assert.equal(s.completionLogs.length, 0);
  assert.equal(s.extraCareLogs[0].countsAsCompletion, false);
});
test('5: Count as Completed on Oct 17 resets a 5-day cycle to Oct 22', () => {
  const s = addExtraCare(periodic(undefined, { lastCompletedAt: '2026-10-15' }), { careId: 'mask', countsAsCompletion: true }, '2026-10-17');
  assert.equal(s.items[0].nextDueAt, '2026-10-22');
  assert.equal(s.items[0].lastCompletedAt, '2026-10-17');
  assert.equal(s.completionLogs[0].source, 'extra');
  assert.equal(s.extraCareLogs[0].countsAsCompletion, true);
});
test('6: duplicate formal completion (including Extra) never advances twice', () => {
  const s = completeCareItem(periodic(), 'mask', '2026-10-15');
  assert.equal(completeCareItem(s, 'mask', '2026-10-15'), s);
  const extra = addExtraCare(s, { careId: 'mask', countsAsCompletion: true }, '2026-10-15');
  assert.equal(extra.items[0].nextDueAt, '2026-10-20');
  assert.equal(extra.completionLogs.length, 1);
});
test('7: frequency edit from 5 to 7 days recalculates from Last Oct 10', () => {
  const s = periodic();
  const next = saveCareItem(s, { ...s.items[0], frequency: { mode: 'interval', days: 7 } }, '2026-10-15');
  assert.equal(next.items[0].nextDueAt, '2026-10-17');
});
test('8: Last Completed edit Oct 10 → Oct 12 recalculates Next Oct 17', () => {
  const s = periodic();
  const next = saveCareItem(s, { ...s.items[0], lastCompletedAt: '2026-10-12' }, '2026-10-15');
  assert.equal(next.items[0].nextDueAt, '2026-10-17');
  assert.equal(next.completionLogs.length, 0); // date correction is not a fabricated activity log
});
test('9: Daily completion belongs only to its local date', () => {
  const s = completeCareItem(routine(), 'face', '2026-10-15', 'routine');
  assert(isCompletedToday(s, 'face', '2026-10-15'));
  assert(!isCompletedToday(s, 'face', '2026-10-16'));
  assert.equal(careForToday(s, '2026-10-16').routine.length, 1);
  const loaded = normalizeSkinCare(s, '2026-10-16');
  assert.equal(loaded.items[0].lastCompletedAt, '2026-10-15');
  assert(!isCompletedToday(loaded, 'face', '2026-10-16'));
});
test('10: Routine weekdays use the local weekday; unfinished periodic weekdays remain due', () => {
  const s = routine({ frequency: { mode: 'weekdays', weekdays: [2,6] } });
  assert(isRoutineToday(s.items[0], '2026-10-17')); // Sat
  assert(!isRoutineToday(s.items[0], '2026-10-18'));
  const scheduled = periodic(undefined, { frequency: { mode: 'weekdays', weekdays: [2,6] }, lastCompletedAt: '2026-10-13' });
  assert.equal(scheduled.items[0].nextDueAt, '2026-10-17');
  assert(isCareDueToday(scheduled.items[0], '2026-10-18')); // does not disappear on Sunday
});
test('11: local midnight, UTC offsets, DST, leap years and year boundaries', () => {
  assert.equal(addLocalDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addLocalDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addLocalDays('2026-03-07', 2), '2026-03-09');
  assert.equal(addLocalDays('2026-10-31', 2), '2026-11-02');
  assert.equal(isLocalDateKey('2026-02-30'), false);
  assert.equal(getLocalDateKey(new Date(2026, 9, 15, 23, 59)), '2026-10-15');
  assert.equal(getLocalDateKey(new Date(2026, 9, 16, 0, 0)), '2026-10-16');
  const code = "import {getLocalDateKey,addLocalDays} from './src/dates.js';console.log(getLocalDateKey(new Date('2026-10-16T02:00:00Z'))+' '+addLocalDays('2026-03-07',2))";
  const inZone = TZ => execFileSync(process.execPath, ['--input-type=module','-e',code], { cwd: new URL('..', import.meta.url), env: { ...process.env, TZ }, encoding: 'utf8' }).trim();
  assert.equal(inZone('America/New_York'), '2026-10-15 2026-03-09');
  assert.equal(inZone('Pacific/Kiritimati'), '2026-10-16 2026-03-09');
});
test('Weekly is +7 actual local days, not a fixed weekday', () => {
  let s = periodic(undefined, { frequency: { mode: 'weekly' } });
  assert.equal(s.items[0].nextDueAt, '2026-10-17');
  s = completeCareItem(s, 'mask', '2026-10-19');
  assert.equal(s.items[0].nextDueAt, '2026-10-26');
});
test('first periodic item offers Due Today or Start From Today without fake completion', () => {
  const due = periodic(undefined, { lastCompletedAt: null });
  const start = periodic(undefined, { lastCompletedAt: null, startMode: 'start' });
  assert.equal(due.items[0].nextDueAt, '2026-10-15');
  assert.equal(start.items[0].nextDueAt, '2026-10-20');
  assert.equal(start.items[0].lastCompletedAt, null);
  assert.equal(start.completionLogs.length, 0);
  assert.equal(normalizeSkinCare(start, '2026-10-18').items[0].nextDueAt, '2026-10-20');
  const renamed = saveCareItem(start, { ...start.items[0], name: 'Renamed mask' }, '2026-10-18');
  assert.equal(renamed.items[0].nextDueAt, '2026-10-20');
});
test('custom Extra stays in that day, never creates a recurring item', () => {
  const s = addExtraCare(emptySkinCare(), { name: 'Foot soak', countsAsCompletion: true }, '2026-10-17');
  assert.equal(s.items.length, 0); assert.equal(s.completionLogs.length, 0);
  assert.equal(s.extraCareLogs[0].countsAsCompletion, false);
  assert.equal(careForToday(s, '2026-10-17').extra.length, 1);
  assert.equal(careForToday(s, '2026-10-18').extra.length, 0);
});
test('old storage gains an empty Skin Care section; existing data and the v3 key persist', () => {
  const old = { version: 3, themeId: 'kitty', habits: [{ id: 'keep' }], days: { '2026-10-15': { tasks: [{ id: 't', completed: true }] } }, workouts: [{ id: 'w' }], literaryFavorites: ['austen-01'] };
  const s = migrateState(old);
  assert.deepEqual(s.skinCare, emptySkinCare());assert.deepEqual(s.days, old.days);assert.deepEqual(s.workouts, old.workouts);assert.deepEqual(s.habits, old.habits);
  s.skinCare = completeCareItem(periodic(), 'mask', '2026-10-15');
  const values = new Map();const storage = { getItem: key => values.get(key) || null, setItem: (key,value) => values.set(key,value) };
  saveState(s, storage);assert(values.has('daily-reset-pwa:v3'));assert.equal(values.size, 1);
  const loaded = loadState(storage);assert.deepEqual(loaded.skinCare, s.skinCare);assert.equal(loaded.themeId, 'kitty');
  assert.equal(completeCareItem(loaded.skinCare, 'mask', '2026-10-15').completionLogs.length, 1);
});
test('malformed records and duplicate logs are safe; deleting an item retains log snapshots', () => {
  assert.deepEqual(normalizeSkinCare(null), emptySkinCare());
  let s = completeCareItem(periodic(), 'mask', '2026-10-15');
  s.completionLogs.push({ ...s.completionLogs[0], id: 'duplicate' });
  s = normalizeSkinCare(s);assert.equal(s.completionLogs.length, 1);
  s = deleteCareItem(s, 'mask');assert.equal(s.items.length, 0);assert.equal(s.completionLogs[0].careName, 'Hand Mask');
  assert.equal(saveCareItem(s, { name: '', type: 'routine' }, '2026-10-15'), s);
});
