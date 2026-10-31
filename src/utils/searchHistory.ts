export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

const STORAGE_KEY = 'edupath_search_history';

export function loadSearchHistory(storageKey = STORAGE_KEY): SearchHistoryItem[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => typeof item?.query === 'string' && item.query.trim().length > 0);
    }
  } catch (e) {
    console.warn('Failed to parse search history from localStorage:', e);
  }
  return [];
}

export function saveSearchHistory(history: SearchHistoryItem[], storageKey = STORAGE_KEY): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save search history to localStorage:', e);
  }
}

export function addSearchQuery(
  query: string,
  currentHistory: SearchHistoryItem[],
  maxItems = 10
): SearchHistoryItem[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return currentHistory;
  }

  // Remove existing occurrence case-insensitively
  const filtered = currentHistory.filter(
    item => item.query.toLowerCase() !== trimmed.toLowerCase()
  );

  const newItem: SearchHistoryItem = {
    query: trimmed,
    timestamp: Date.now(),
  };

  return [newItem, ...filtered].slice(0, maxItems);
}

export function removeSearchQuery(
  queryToRemove: string,
  currentHistory: SearchHistoryItem[]
): SearchHistoryItem[] {
  return currentHistory.filter(
    item => item.query.toLowerCase() !== queryToRemove.toLowerCase()
  );
}
