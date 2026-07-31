import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_THEME_ID, THEMES, getTheme, normalizeThemeId } from "../src/config/themes.js";
import { loadState, migrateState, saveState } from "../src/storage.js";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("defines four complete centralized themes", () => {
  const required = [
    "id", "name", "primary", "primaryDark", "background", "card", "text",
    "mutedText", "accent", "border", "waterColor", "coverImage", "mascotImage",
    "completedImage", "thumbnailImage",
  ];
  assert.deepEqual(THEMES.map((theme) => theme.id), ["pompompurin", "kitty", "miffy", "bearisbug"]);
  for (const theme of THEMES) {
    for (const field of required) assert.ok(theme[field], `${theme.id}.${field} is required`);
    assert.match(theme.coverImage, new RegExp(`^themes/${theme.id}/`));
  }
});

test("falls back safely to bearisbug for missing or invalid theme ids", () => {
  assert.equal(normalizeThemeId(undefined), DEFAULT_THEME_ID);
  assert.equal(normalizeThemeId("not-a-theme"), DEFAULT_THEME_ID);
  assert.equal(getTheme("not-a-theme").id, DEFAULT_THEME_ID);
});

test("migrates v2 data to v3 without affecting existing records", () => {
  const migrated = migrateState({
    version: 2,
    habits: [{ id: "habit", name: "习惯", active: true }],
    days: { "2026-07-30": { tasks: [{ id: "task", completed: true }] } },
    workouts: [{ id: "workout" }],
    waterDays: { "2026-07-30": { date: "2026-07-30", totalMl: 600, entries: [{ id: "water", amountMl: 600 }] } },
  });
  assert.equal(migrated.version, 3);
  assert.equal(migrated.themeId, DEFAULT_THEME_ID);
  assert.equal(migrated.days["2026-07-30"].tasks[0].id, "task");
  assert.equal(migrated.workouts[0].id, "workout");
  assert.equal(migrated.waterDays["2026-07-30"].totalMl, 600);
});

test("persists a selected theme in versioned localStorage", () => {
  const storage = memoryStorage();
  const state = migrateState({ version: 2, habits: [], days: {}, workouts: [], themeId: "kitty" });
  saveState(state, storage);
  const loaded = loadState(storage);
  assert.equal(loaded.version, 3);
  assert.equal(loaded.themeId, "kitty");
});
