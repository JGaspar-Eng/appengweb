export function salvarLocal<T = any>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch { }
}

export function lerLocal<T = any>(key: string, fallback: T | null = null): T | null {
  if (typeof window === "undefined") return fallback;
  try {
    const val = window.localStorage.getItem(key);
    return val ? JSON.parse(val) as T : fallback;
  } catch {
    return fallback;
  }
}
