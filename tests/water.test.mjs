import test from "node:test";
import assert from "node:assert/strict";
import { loadState, migrateState, saveState } from "../src/storage.js";
import {
  addWater,
  createWaterDay,
  ensureWaterDay,
  getSevenDayWaterStats,
  undoLastWater,
  updateWaterSettings,
  waterProgress,
} from "../src/water.js";

function baseState() {
  return migrateState({
    version: 1,
    habits: [{ id: "wake", name: "规律起床", active: true }],
    days: { "2026-07-30": { tasks: [{ id: "task-1", completed: true }] } },
    workouts: [{ id: "workout-1", date: "2026-07-30" }],
  });
}

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("migrates v1 data without changing tasks, habits, or workouts", () => {
  const migrated = baseState();
  assert.equal(migrated.version, 3);
  assert.equal(migrated.waterSettings.goalMl, 2200);
  assert.equal(migrated.waterSettings.cupSizeMl, 600);
  assert.deepEqual(migrated.days["2026-07-30"].tasks, [{ id: "task-1", completed: true }]);
  assert.equal(migrated.habits[0].name, "规律起床");
  assert.equal(migrated.workouts[0].id, "workout-1");
});

test("adds 600ml and 200ml, then undo removes only the latest entry", () => {
  let state = ensureWaterDay(baseState(), "2026-07-30");
  state = addWater(state, "2026-07-30", 600, { id: "cup", createdAt: "2026-07-30T08:00:00.000Z" });
  state = addWater(state, "2026-07-30", 200, { id: "small", createdAt: "2026-07-30T09:00:00.000Z" });
  assert.equal(state.waterDays["2026-07-30"].totalMl, 800);
  assert.equal(state.waterDays["2026-07-30"].entries.length, 2);

  state = undoLastWater(state, "2026-07-30");
  assert.equal(state.waterDays["2026-07-30"].totalMl, 600);
  assert.deepEqual(state.waterDays["2026-07-30"].entries.map((entry) => entry.id), ["cup"]);
});

test("supports custom amounts, remaining goal, completion, and overflow", () => {
  let state = ensureWaterDay(baseState(), "2026-07-30");
  state = addWater(state, "2026-07-30", 1800, { id: "custom-1800" });
  let progress = waterProgress(state.waterDays["2026-07-30"]);
  assert.equal(progress.remainingMl, 400);
  assert.equal(progress.completed, false);

  state = addWater(state, "2026-07-30", 400, { id: "target" });
  progress = waterProgress(state.waterDays["2026-07-30"]);
  assert.equal(progress.totalMl, 2200);
  assert.equal(progress.percent, 100);
  assert.equal(progress.completed, true);

  state = addWater(state, "2026-07-30", 600, { id: "overflow" });
  progress = waterProgress(state.waterDays["2026-07-30"]);
  assert.equal(progress.totalMl, 2800);
  assert.equal(progress.excessMl, 600);
  assert.equal(progress.percent, 127);
  assert.equal(progress.visualPercent, 100);
});

test("saves and reloads v3 water data", () => {
  const storage = memoryStorage();
  let state = ensureWaterDay(baseState(), "2026-07-30");
  state = addWater(state, "2026-07-30", 600, { id: "persisted" });
  saveState(state, storage);

  const loaded = loadState(storage);
  assert.equal(loaded.waterDays["2026-07-30"].totalMl, 600);
  assert.equal(loaded.waterDays["2026-07-30"].entries[0].id, "persisted");
});

test("loads a legacy v1 key when newer storage has not been created", () => {
  const legacy = JSON.stringify({ version: 1, habits: [], days: {}, workouts: [] });
  const storage = memoryStorage({ "daily-reset-pwa:v1": legacy });
  const loaded = loadState(storage);
  assert.equal(loaded.version, 3);
  assert.equal(loaded.waterSettings.goalMl, 2200);
});

test("loads a legacy v2 key and keeps water records", () => {
  const legacy = JSON.stringify({
    version: 2,
    habits: [],
    days: {},
    workouts: [],
    waterSettings: { goalMl: 2400, cupSizeMl: 500 },
    waterDays: {
      "2026-07-30": {
        date: "2026-07-30",
        goalMl: 2400,
        cupSizeMl: 500,
        totalMl: 500,
        entries: [{ id: "legacy-water", amountMl: 500, createdAt: "2026-07-30T08:00:00.000Z" }],
      },
    },
  });
  const storage = memoryStorage({ "daily-reset-pwa:v2": legacy });
  const loaded = loadState(storage);
  assert.equal(loaded.version, 3);
  assert.equal(loaded.waterSettings.cupSizeMl, 500);
  assert.equal(loaded.waterDays["2026-07-30"].totalMl, 500);
});

test("creates an independent water record for a new date", () => {
  let state = ensureWaterDay(baseState(), "2026-07-30");
  state = addWater(state, "2026-07-30", 600, { id: "day-one" });
  state = ensureWaterDay(state, "2026-07-31");
  assert.equal(state.waterDays["2026-07-30"].totalMl, 600);
  assert.deepEqual(state.waterDays["2026-07-31"], createWaterDay("2026-07-31"));
});

test("updates current and future water settings while retaining historical settings", () => {
  let state = ensureWaterDay(baseState(), "2026-07-29");
  state = ensureWaterDay(state, "2026-07-30");
  state = updateWaterSettings(state, "2026-07-30", { goalMl: 2400, cupSizeMl: 500 });
  state = ensureWaterDay(state, "2026-07-31");

  assert.equal(state.waterDays["2026-07-29"].goalMl, 2200);
  assert.equal(state.waterDays["2026-07-30"].goalMl, 2400);
  assert.equal(state.waterDays["2026-07-31"].cupSizeMl, 500);
});

test("calculates seven-day target count, average, percentages, and current streak", () => {
  const keys = Array.from({ length: 7 }, (_, index) => `2026-07-${String(24 + index).padStart(2, "0")}`);
  let state = baseState();
  for (const key of keys) state = ensureWaterDay(state, key);
  state = addWater(state, keys[0], 1100, { id: "half" });
  state = addWater(state, keys[4], 2200, { id: "met-1" });
  state = addWater(state, keys[5], 2400, { id: "met-2" });
  state = addWater(state, keys[6], 2200, { id: "met-3" });

  const stats = getSevenDayWaterStats(state, keys);
  assert.equal(stats.targetDays, 3);
  assert.equal(stats.averageMl, 1129);
  assert.equal(stats.streak, 3);
  assert.equal(stats.days[5].percent, 109);
  assert.equal(stats.days[5].visualPercent, 100);
});
