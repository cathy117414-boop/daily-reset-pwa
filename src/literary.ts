import { literaryQuotes } from './data/literaryQuotes.ts';

const EPOCH = Date.UTC(2026, 0, 1);
const DAY_MS = 86_400_000;

// Convert local calendar components to UTC solely for arithmetic: DST cannot skip a line.
export function dailyQuoteIndex(dateKey: string, count = literaryQuotes.length): number {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('Quote count must be positive');
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) throw new RangeError('Expected a local YYYY-MM-DD date');
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    throw new RangeError('Invalid calendar date');
  }
  const days = Math.floor((date.getTime() - EPOCH) / DAY_MS);
  return ((days % count) + count) % count;
}

export function getDailyQuote(dateKey: string) {
  return literaryQuotes[dailyQuoteIndex(dateKey)];
}

export function normalizeLiteraryFavorites(value: unknown): string[] {
  const ids = new Set(literaryQuotes.map(q => q.id));
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && ids.has(id)))] : [];
}

export function toggleLiteraryFavorite(favorites: string[], id: string): string[] {
  const clean = normalizeLiteraryFavorites(favorites);
  if (!literaryQuotes.some(q => q.id === id)) return clean;
  return clean.includes(id) ? clean.filter(item => item !== id) : [...clean, id];
}
