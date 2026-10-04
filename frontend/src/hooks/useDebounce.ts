import { useEffect, useState } from 'react';

// Standard debounce hook — returns `value` only after it's stopped
// changing for `delayMs`. Used here to avoid firing a search request on
// every single keystroke (§39's debouncing requirement).
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}