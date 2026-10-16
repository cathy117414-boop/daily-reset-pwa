import { addLocalDays, getLocalDateKey, getLocalWeekday, isLocalDateKey } from '../../dates.js';

export { getLocalDateKey, addLocalDays } from '../../dates.js';
export const WEEKDAYS = [{ day: 1, label: 'Mon' }, { day: 2, label: 'Tue' }, { day: 3, label: 'Wed' }, { day: 4, label: 'Thu' }, { day: 5, label: 'Fri' }, { day: 6, label: 'Sat' }, { day: 0, label: 'Sun' }];
const dateOrNull = value => isLocalDateKey(value) ? value : null;
const makeId = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
export const emptySkinCare = () => ({ schemaVersion: 1, items: [], completionLogs: [], extraCareLogs: [] });

export function normalizeFrequency(frequency, type = 'routine') {
  if (frequency?.mode === 'weekdays') {
    const weekdays = [...new Set((Array.isArray(frequency.weekdays) ? frequency.weekdays : []).filter(d => Number.isInteger(d) && d >= 0 && d <= 6))];
    if (weekdays.length) return { mode: 'weekdays', days: null, weekdays };
  }
  if (type === 'routine') return { mode: 'daily', days: null, weekdays: [] };
  if (frequency?.mode === 'weekly') return { mode: 'weekly', days: null, weekdays: [] };
  const days = Math.round(Number(frequency?.days));
  return { mode: 'interval', days: Number.isFinite(days) && days >= 1 && days <= 365 ? days : 7, weekdays: [] };
}

export function frequencyLabel(frequency) {
  if (frequency.mode === 'weekdays') return WEEKDAYS.filter(d => frequency.weekdays.includes(d.day)).map(d => d.label).join(' / ');
  if (frequency.mode === 'daily') return 'Daily';
  if (frequency.mode === 'weekly') return 'Weekly';
  return `Every ${frequency.days} ${frequency.days === 1 ? 'day' : 'days'}`;
}

export function calculateNextDueDate(date, frequency) {
  if (!isLocalDateKey(date)) return null;
  if (frequency.mode === 'weekdays') {
    for (let n = 1; n <= 7; n++) {
      const next = addLocalDays(date, n);
      if (frequency.weekdays.includes(getLocalWeekday(next))) return next;
    }
    return null;
  }
  return addLocalDays(date, frequency.mode === 'weekly' ? 7 : frequency.days);
}

export function careItemFromInput(input, today, existing) {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name || !isLocalDateKey(today)) return null;
  const type = input.type === 'periodic' ? 'periodic' : 'routine';
  const frequency = normalizeFrequency(input.frequency, type);
  const lastCompletedAt = type === 'periodic' ? dateOrNull(input.lastCompletedAt) : dateOrNull(existing?.lastCompletedAt);
  const startMode = input.startMode === 'start' ? 'start' : 'due';
  const resetStart = existing && (!lastCompletedAt && existing.lastCompletedAt || existing.startMode !== startMode);
  const cycleStartedAt = resetStart ? today : dateOrNull(existing?.cycleStartedAt) || today;
  const nextDueAt = type === 'periodic'
    ? lastCompletedAt ? calculateNextDueDate(lastCompletedAt, frequency)
      : startMode === 'start' ? calculateNextDueDate(cycleStartedAt, frequency) : cycleStartedAt
    : null;
  const scheduleChanged = existing && (existing.type !== type || existing.lastCompletedAt !== lastCompletedAt || JSON.stringify(existing.frequency) !== JSON.stringify(frequency) || existing.startMode !== startMode);
  return { id: existing?.id || input.id || makeId('care'), name, type, frequency, lastCompletedAt, nextDueAt,
    snoozedUntil: scheduleChanged ? null : dateOrNull(existing?.snoozedUntil), cycleStartedAt, startMode,
    icon: 'care', enabled: existing?.enabled !== false };
}

export function normalizeSkinCare(raw, today = getLocalDateKey()) {
  if (!raw || typeof raw !== 'object') return emptySkinCare();
  const ids = new Set();
  const items = (Array.isArray(raw.items) ? raw.items : []).flatMap(value => {
    if (!value || typeof value !== 'object' || typeof value.id !== 'string' || !value.id || ids.has(value.id)) return [];
    const item = careItemFromInput(value, today, value);
    if (!item) return [];
    ids.add(item.id);
    // Persist the original due date, including an unfinished weekday schedule.
    if (item.type === 'periodic' && !item.lastCompletedAt && dateOrNull(value.nextDueAt)) item.nextDueAt = value.nextDueAt;
    return [item];
  });
  const seen = new Set();
  const completionLogs = (Array.isArray(raw.completionLogs) ? raw.completionLogs : []).flatMap(log => {
    if (!log || typeof log.careId !== 'string' || !dateOrNull(log.date) || seen.has(`${log.careId}:${log.date}`)) return [];
    seen.add(`${log.careId}:${log.date}`);
    return [{ id: typeof log.id === 'string' ? log.id : `${log.careId}:${log.date}`, careId: log.careId,
      careName: typeof log.careName === 'string' ? log.careName : '', date: log.date,
      source: ['routine','due','extra'].includes(log.source) ? log.source : 'due' }];
  });
  const extraIds = new Set();
  const extraCareLogs = (Array.isArray(raw.extraCareLogs) ? raw.extraCareLogs : []).flatMap(log => {
    if (!log || typeof log.id !== 'string' || extraIds.has(log.id) || typeof log.name !== 'string' || !log.name.trim() || !dateOrNull(log.date)) return [];
    extraIds.add(log.id);
    return [{ id: log.id, careId: typeof log.careId === 'string' ? log.careId : null, name: log.name, date: log.date, countsAsCompletion: log.countsAsCompletion === true }];
  });
  return { schemaVersion: 1, items, completionLogs, extraCareLogs };
}

export function saveCareItem(skin, input, today) {
  const existing = skin.items.find(item => item.id === input.id);
  if (input.lastCompletedAt && (!isLocalDateKey(input.lastCompletedAt) || input.lastCompletedAt > today)) return skin;
  const item = careItemFromInput(input, today, existing);
  if (!item) return skin;
  return { ...skin, items: existing ? skin.items.map(care => care.id === item.id ? item : care) : [...skin.items, item] };
}

export function deleteCareItem(skin, id) {
  // Logs retain name snapshots; deleting a definition does not erase history.
  return { ...skin, items: skin.items.filter(item => item.id !== id) };
}

export function isCompletedToday(skin, id, today) {
  return skin.completionLogs.some(log => log.careId === id && log.date === today);
}

export function isRoutineToday(item, today) {
  return item.enabled && item.type === 'routine' && (item.frequency.mode === 'daily' || item.frequency.weekdays.includes(getLocalWeekday(today)));
}

export function isCareDueToday(item, today, logs = []) {
  return item.enabled && item.type === 'periodic' && !!item.nextDueAt && item.nextDueAt <= today
    && (!item.snoozedUntil || item.snoozedUntil <= today) && !logs.some(log => log.careId === item.id && log.date === today);
}

export function completeCareItem(skin, id, today, source = 'due') {
  const item = skin.items.find(care => care.id === id && care.enabled);
  if (!item || !isLocalDateKey(today) || isCompletedToday(skin, id, today)) return skin;
  return { ...skin,
    items: skin.items.map(care => care.id !== id ? care : { ...care, lastCompletedAt: today,
      nextDueAt: care.type === 'periodic' ? calculateNextDueDate(today, care.frequency) : null, snoozedUntil: null }),
    completionLogs: [...skin.completionLogs, { id: makeId('care-done'), careId: id, careName: item.name, date: today, source }],
  };
}

export function snoozeCareItemToTomorrow(skin, id, today) {
  const item = skin.items.find(care => care.id === id);
  if (!item || !isCareDueToday(item, today, skin.completionLogs)) return skin;
  return { ...skin, items: skin.items.map(care => care.id === id ? { ...care, snoozedUntil: addLocalDays(today, 1) } : care) };
}

export function addExtraCare(skin, input, today) {
  if (!isLocalDateKey(today)) return skin;
  const item = skin.items.find(care => care.id === input.careId && care.enabled);
  const name = item?.name || (typeof input.name === 'string' ? input.name.trim() : '');
  if (!name) return skin;
  const countsAsCompletion = item?.type === 'periodic' && input.countsAsCompletion === true;
  const next = countsAsCompletion ? completeCareItem(skin, item.id, today, 'extra') : skin;
  return { ...next, extraCareLogs: [...next.extraCareLogs, { id: makeId('care-extra'), careId: item?.id || null, name, date: today, countsAsCompletion: !!countsAsCompletion }] };
}

export function careForToday(skin, today) {
  return {
    routine: skin.items.filter(item => isRoutineToday(item, today)),
    due: skin.items.filter(item => item.enabled && item.type === 'periodic' && (isCareDueToday(item, today, skin.completionLogs) || isCompletedToday(skin, item.id, today))),
    extra: skin.extraCareLogs.filter(log => log.date === today),
  };
}
