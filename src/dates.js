export function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isLocalDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && getLocalDateKey(date) === value;
}

export function addLocalDays(key, amount) {
  if (!isLocalDateKey(key) || !Number.isInteger(amount)) return null;
  // Local noon and calendar arithmetic avoid UTC shifts and DST-length days.
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return getLocalDateKey(date);
}

export function getLocalWeekday(key) {
  return isLocalDateKey(key) ? new Date(`${key}T12:00:00`).getDay() : -1;
}

export function formatLocalDate(key, options = { month: 'short', day: 'numeric' }) {
  return isLocalDateKey(key) ? new Intl.DateTimeFormat('en-US', options).format(new Date(`${key}T12:00:00`)) : '—';
}
