import { Atom, ReadOnlyAtom, Option } from '@grammarly/focal'

export function requireAtom<T, U, V>(
  atom: Atom<Option<T>>,
  defaultValue: U,
  fn: (rAtom: Atom<T>) => V
): ReadOnlyAtom<U | V> {
  return atom.view(value => {
    if (value === undefined) {
      return defaultValue
    }
    return fn(atom as Atom<T>)
  })
}

export function modifyAtom<T>(atom: Atom<T>, mod: (prev: T) => T) {
  return () => atom.modify(mod)
}
