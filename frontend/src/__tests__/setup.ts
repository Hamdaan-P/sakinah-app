import '@testing-library/jest-dom/vitest'

// jsdom provides `window.localStorage` but Zustand's `persist` middleware
// calls it before any test code runs (during `create(persist(...))` at
// module-import time). Provide a tiny in-memory shim that survives module
// scope so any persist read/write at import time works in vitest's
// happy-dom-like jsdom env.
class InMemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(key: string): string | null { return this.map.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.map.keys())[index] ?? null; }
  removeItem(key: string): void { this.map.delete(key); }
  setItem(key: string, value: string): void { this.map.set(key, value); }
}

if (typeof window !== 'undefined' && (!window.localStorage || typeof window.localStorage.setItem !== 'function')) {
  Object.defineProperty(window, 'localStorage', { value: new InMemoryStorage() });
}
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.setItem !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', { value: new InMemoryStorage(), configurable: true });
}
