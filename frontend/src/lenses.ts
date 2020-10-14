import { Lens } from 'harmaja'

// Unsafe: pred must return true for one of the elements
export function find<T>(pred: (x: T) => boolean): Lens<T[], T> {
  return {
    get: (root) => root.find(pred)!,
    set: (root, value) => {
      const index = root.findIndex(pred)!
      return [...root.slice(0, index), value, ...root.slice(index + 1)]
    }
  }
}
