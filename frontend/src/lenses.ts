import { Lens } from 'harmaja'

// Unsafe: pred must return true for one of the elements
export function find<T>(pred: (x: T) => boolean): Lens<T[], T> {
  return {
    get: root => root.find(pred)!,
    set: (root, value) => {
      const index = root.findIndex(pred)!
      return [...root.slice(0, index), value, ...root.slice(index + 1)]
    },
  }
}

export const pick = <T, K extends keyof T>(keys: K[]): Lens<T, Pick<T, K>> => ({
  get(root) {
    const result: Pick<T, K> = {} as any
    keys.forEach(key => {
      result[key] = root[key]
    })
    return result
  },
  set(root, value) {
    return { ...root, ...value }
  },
})
