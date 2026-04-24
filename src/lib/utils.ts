import { t } from '@/locales';

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function normalizeSearch(s: string): string {
  return s.normalize('NFKC').toLowerCase();
}

export function matchesSearch(query: string, title: string, tags: string[]): boolean {
  const q = normalizeSearch(query).trim();
  if (q === '') return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  const haystack = normalizeSearch(title + ' ' + tags.join(' '));
  return tokens.every((tok) => haystack.includes(tok));
}

export function formatRelativeTime(when: Date, now: Date = new Date()): string {
  const diff = now.getTime() - when.getTime();
  if (diff < 60_000) return t.time.justNow;
  if (diff < 3600_000) return t.time.minutesAgo(Math.floor(diff / 60_000));
  if (diff < 86_400_000) return t.time.hoursAgo(Math.floor(diff / 3600_000));
  if (diff < 7 * 86_400_000) return t.time.daysAgo(Math.floor(diff / 86_400_000));
  return t.time.dateFmt(when);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
