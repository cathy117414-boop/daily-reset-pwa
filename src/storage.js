import { DEFAULT_WATER_SETTINGS, normalizeWaterDay, normalizeWaterSettings } from "./water.js";
import { DEFAULT_THEME_ID, normalizeThemeId } from "./config/themes.js";
import { normalizeLiteraryFavorites } from "./literary.ts";
import { getLocalDateKey } from "./dates.js";
import { emptySkinCare, normalizeSkinCare } from "./features/skin-care/skinCare.js";

const STORAGE_KEY = "daily-reset-pwa:v3";
const LEGACY_STORAGE_KEYS = ["daily-reset-pwa:v2", "daily-reset-pwa:v1"];

export const DEFAULT_HABITS = [
  { id: "wake", time: "07:30", module: "生活", name: "规律起床", note: "起床后先喝一杯水", active: true },
  { id: "codex", time: "09:00", module: "成长", name: "Codex训练", note: "完成今天的练习", active: true },
  { id: "fitness", time: "17:30", module: "健身", name: "健身或运动", note: "至少活动30分钟", active: true },
  { id: "english", time: "20:00", module: "语言", name: "英语口语", note: "影子跟读20分钟", active: true },
  { id: "french", time: "20:30", module: "语言", name: "法语", note: "学习或复习15分钟", active: true },
  { id: "medicine", time: "21:30", module: "护理", name: "脚趾甲涂药", note: "洗澡后完成", active: true },
  { id: "lotion", time: "21:35", module: "护理", name: "涂身体乳", note: "洗澡后全身护理", active: true },
  { id: "sleep", time: "23:00", module: "睡眠", name: "按时睡觉", note: "放下手机，准备入睡", active: true },
];

function createInitialState() {
  return {
    version: 3,
    themeId: DEFAULT_THEME_ID,
    literaryFavorites: [],
    skinCare: emptySkinCare(),
    habits: DEFAULT_HABITS.map((habit) => ({ ...habit })),
    days: {},
    workouts: [],
    waterSettings: { ...DEFAULT_WATER_SETTINGS },
    waterDays: {},
  };
}

export function migrateState(parsed) {
  const initialState = createInitialState();
  if (!parsed || typeof parsed !== "object") return initialState;

  const waterSettings = normalizeWaterSettings(parsed.waterSettings);
  const waterDays = Object.fromEntries(
    Object.entries(parsed.waterDays || {}).map(([date, record]) => [
      date,
      normalizeWaterDay(record, date, waterSettings),
    ]),
  );

  return {
    ...initialState,
    ...parsed,
    version: 3,
    themeId: normalizeThemeId(parsed.themeId),
    literaryFavorites: normalizeLiteraryFavorites(parsed.literaryFavorites),
    skinCare: normalizeSkinCare(parsed.skinCare),
    habits: Array.isArray(parsed.habits) ? parsed.habits : initialState.habits,
    days: parsed.days && typeof parsed.days === "object" ? parsed.days : {},
    workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
    waterSettings,
    waterDays,
  };
}

export function loadState(storage = localStorage) {
  try {
    const current = storage.getItem(STORAGE_KEY);
    const legacy = LEGACY_STORAGE_KEYS.map((key) => storage.getItem(key)).find(Boolean);
    return migrateState(JSON.parse(current || legacy));
  } catch {
    return createInitialState();
  }
}

export function saveState(state, storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: 3, themeId: normalizeThemeId(state.themeId) }));
}

export function getDateKey(date = new Date()) {
  return getLocalDateKey(date);
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function ensureDay(state, dateKey) {
  if (state.days[dateKey]) return state;

  const tasks = state.habits
    .filter((habit) => habit.active)
    .map((habit) => ({
      id: `${dateKey}:${habit.id}`,
      habitId: habit.id,
      time: habit.time,
      module: habit.module,
      name: habit.name,
      note: habit.note,
      completed: false,
      temporary: false,
    }));

  return {
    ...state,
    days: {
      ...state.days,
      [dateKey]: { tasks },
    },
  };
}

export function completionForDay(state, dateKey) {
  const tasks = state.days[dateKey]?.tasks || [];
  const completed = tasks.filter((task) => task.completed).length;
  return {
    total: tasks.length,
    completed,
    percent: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
  };
}
