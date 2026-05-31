export function deepClone<T>(value: T): T {
  try {
    return JSON.parse(JSON.stringify(value)) as T
  } catch {
    return value
  }
}

/**
 * Deterministic JSON stringify.
 * - Sorts object keys
 * - Drops functions
 * - Normalizes Date
 * - Handles circular references
 */
export function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>()

  const normalize = (v: any): any => {
    if (v === null || v === undefined) return v
    if (typeof v !== 'object') return v
    if (typeof v === 'function') return undefined
    if (v instanceof Date) return v.toISOString()

    if (seen.has(v)) return '[Circular]'
    seen.add(v)

    if (Array.isArray(v)) return v.map(normalize)

    const out: Record<string, any> = {}
    for (const key of Object.keys(v).sort()) {
      out[key] = normalize(v[key])
    }
    return out
  }

  try {
    return JSON.stringify(normalize(value))
  } catch {
    try {
      return String(value)
    } catch {
      return ''
    }
  }
}
