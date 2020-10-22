import { Lens } from 'harmaja'

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
