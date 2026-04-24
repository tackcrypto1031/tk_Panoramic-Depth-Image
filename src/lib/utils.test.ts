import { describe, it, expect } from 'vitest';
import { cn, normalizeSearch, formatRelativeTime, matchesSearch } from './utils';

describe('cn', () => {
  it('joins truthy strings', () => {
    expect(cn('a', 'b', false, undefined, 'c')).toBe('a b c');
  });
});

describe('normalizeSearch', () => {
  it('lowercases and NFKC-normalizes', () => {
    expect(normalizeSearch('Hello Wo RLD')).toBe('hello wo rld');
    expect(normalizeSearch('ABC')).toBe('abc');
  });
});

describe('matchesSearch', () => {
  it('AND across tokens, across title+tags', () => {
    expect(matchesSearch('海邊 日落', '海邊風景', ['日落', '夏天'])).toBe(true);
    expect(matchesSearch('海邊 冬天', '海邊風景', ['日落', '夏天'])).toBe(false);
  });
  it('empty query matches everything', () => {
    expect(matchesSearch('', 'anything', [])).toBe(true);
  });
  it('case-insensitive', () => {
    expect(matchesSearch('BEACH', 'A beach scene', [])).toBe(true);
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-04-23T12:00:00Z');
  it('just now (<1 min)', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 30_000), now)).toBe('剛剛');
  });
  it('minutes ago', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60_000), now)).toBe('5 分鐘前');
  });
  it('hours ago', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 3600_000), now)).toBe('3 小時前');
  });
  it('days ago (<7)', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 86400_000), now)).toBe('3 天前');
  });
  it('older: absolute date', () => {
    const old = new Date('2026-01-01T00:00:00Z');
    expect(formatRelativeTime(old, now)).toBe('2026-01-01');
  });
});
