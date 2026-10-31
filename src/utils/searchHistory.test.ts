import test from 'node:test';
import assert from 'node:assert/strict';
import { addSearchQuery, removeSearchQuery, SearchHistoryItem } from './searchHistory';

test('addSearchQuery adds a new search query at the front', () => {
  const initial: SearchHistoryItem[] = [
    { query: 'Python', timestamp: 1000 }
  ];
  const updated = addSearchQuery('React', initial);
  assert.equal(updated.length, 2);
  assert.equal(updated[0].query, 'React');
  assert.equal(updated[1].query, 'Python');
});

test('addSearchQuery deduplicates queries case-insensitively and promotes to top', () => {
  const initial: SearchHistoryItem[] = [
    { query: 'Docker', timestamp: 1000 },
    { query: 'Python', timestamp: 2000 },
    { query: 'Kubernetes', timestamp: 3000 }
  ];
  const updated = addSearchQuery('python', initial);
  assert.equal(updated.length, 3);
  assert.equal(updated[0].query, 'python');
  assert.equal(updated[1].query, 'Docker');
  assert.equal(updated[2].query, 'Kubernetes');
});

test('addSearchQuery ignores empty or whitespace-only queries', () => {
  const initial: SearchHistoryItem[] = [
    { query: 'Python', timestamp: 1000 }
  ];
  const updated = addSearchQuery('   ', initial);
  assert.equal(updated.length, 1);
  assert.equal(updated[0].query, 'Python');
});

test('addSearchQuery respects maxItems limit', () => {
  let list: SearchHistoryItem[] = [];
  for (let i = 1; i <= 15; i++) {
    list = addSearchQuery(`Course ${i}`, list, 8);
  }
  assert.equal(list.length, 8);
  assert.equal(list[0].query, 'Course 15');
});

test('removeSearchQuery removes targeted query', () => {
  const initial: SearchHistoryItem[] = [
    { query: 'React', timestamp: 1000 },
    { query: 'TypeScript', timestamp: 2000 },
    { query: 'Node.js', timestamp: 3000 }
  ];
  const updated = removeSearchQuery('TypeScript', initial);
  assert.equal(updated.length, 2);
  assert.equal(updated.find(i => i.query === 'TypeScript'), undefined);
});
