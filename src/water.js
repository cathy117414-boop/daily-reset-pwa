export const DEFAULT_WATER_SETTINGS = Object.freeze({
  goalMl: 2200,
  cupSizeMl: 600,
});

function positiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback;
}

export function normalizeWaterSettings(settings = {}) {
  return {
    goalMl: positiveInteger(settings.goalMl, DEFAULT_WATER_SETTINGS.goalMl),
    cupSizeMl: positiveInteger(settings.cupSizeMl, DEFAULT_WATER_SETTINGS.cupSizeMl),
  };
}

export function createWaterDay(date, settings = DEFAULT_WATER_SETTINGS) {
  const normalized = normalizeWaterSettings(settings);
  return {
    date,
    ...normalized,
    totalMl: 0,
    entries: [],
  };
}

export function normalizeWaterDay(record, date, settings = DEFAULT_WATER_SETTINGS) {
  if (!record || typeof record !== "object") return createWaterDay(date, settings);

  const fallback = normalizeWaterSettings(settings);
  let entries = Array.isArray(record.entries)
    ? record.entries
        .filter((entry) => Number(entry?.amountMl) > 0)
        .map((entry, index) => ({
          id: String(entry.id || `${date}-water-${index}`),
          amountMl: positiveInteger(entry.amountMl, 1),
          createdAt: entry.createdAt || `${date}T00:00:00.000Z`,
        }))
    : [];
  const legacyTotal = Math.max(0, Math.round(Number(record.totalMl) || 0));
  if (!entries.length && legacyTotal > 0) {
    entries = [{
      id: `${date}-water-migrated`,
      amountMl: legacyTotal,
      createdAt: `${date}T00:00:00.000Z`,
    }];
  }
  const entriesTotal = entries.reduce((sum, entry) => sum + entry.amountMl, 0);

  return {
    date,
    goalMl: positiveInteger(record.goalMl, fallback.goalMl),
    cupSizeMl: positiveInteger(record.cupSizeMl, fallback.cupSizeMl),
    totalMl: entriesTotal,
    entries,
  };
}

export function ensureWaterDay(state, date) {
  const current = state.waterDays?.[date];
  if (current) return state;

  return {
    ...state,
    waterDays: {
      ...(state.waterDays || {}),
      [date]: createWaterDay(date, state.waterSettings),
    },
  };
}

export function addWater(state, date, amountMl, options = {}) {
  const amount = positiveInteger(amountMl, 0);
  if (!amount) return state;

  const ensured = ensureWaterDay(state, date);
  const day = normalizeWaterDay(ensured.waterDays[date], date, ensured.waterSettings);
  const createdAt = options.createdAt || new Date().toISOString();
  const entry = {
    id: options.id || `water-${createdAt}-${Math.random().toString(16).slice(2)}`,
    amountMl: amount,
    createdAt,
  };

  return {
    ...ensured,
    waterDays: {
      ...ensured.waterDays,
      [date]: {
        ...day,
        totalMl: day.totalMl + amount,
        entries: [...day.entries, entry],
      },
    },
  };
}

export function undoLastWater(state, date) {
  const current = state.waterDays?.[date];
  if (!current?.entries?.length) return state;

  const day = normalizeWaterDay(current, date, state.waterSettings);
  const entries = day.entries.slice(0, -1);
  return {
    ...state,
    waterDays: {
      ...state.waterDays,
      [date]: {
        ...day,
        entries,
        totalMl: entries.reduce((sum, entry) => sum + entry.amountMl, 0),
      },
    },
  };
}

export function updateWaterSettings(state, date, settings) {
  const normalized = normalizeWaterSettings(settings);
  const ensured = ensureWaterDay(state, date);
  return {
    ...ensured,
    waterSettings: normalized,
    waterDays: {
      ...ensured.waterDays,
      [date]: {
        ...normalizeWaterDay(ensured.waterDays[date], date, normalized),
        ...normalized,
      },
    },
  };
}

export function waterProgress(day, settings = DEFAULT_WATER_SETTINGS) {
  const normalized = normalizeWaterDay(day, day?.date || "", settings);
  const percent = normalized.goalMl ? Math.round((normalized.totalMl / normalized.goalMl) * 100) : 0;
  return {
    ...normalized,
    percent,
    visualPercent: Math.min(percent, 100),
    remainingMl: Math.max(normalized.goalMl - normalized.totalMl, 0),
    excessMl: Math.max(normalized.totalMl - normalized.goalMl, 0),
    wholeCups: Math.floor(normalized.totalMl / normalized.cupSizeMl),
    completed: normalized.totalMl >= normalized.goalMl,
  };
}

export function getSevenDayWaterStats(state, dateKeys) {
  const days = dateKeys.map((date) => ({
    date,
    ...waterProgress(state.waterDays?.[date] || createWaterDay(date, state.waterSettings), state.waterSettings),
  }));
  const totalMl = days.reduce((sum, day) => sum + day.totalMl, 0);
  const targetDays = days.filter((day) => day.completed).length;
  let streak = 0;

  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (!days[index].completed) break;
    streak += 1;
  }

  return {
    days,
    targetDays,
    averageMl: days.length ? Math.round(totalMl / days.length) : 0,
    streak,
  };
}
