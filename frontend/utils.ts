import { Atom } from '@grammarly/focal'

export function modifyAtom<T>(atom: Atom<T>, mod: (prev: T) => T) {
  return () => atom.modify(mod)
}
