import { Atom } from 'harmaja'

type MatchBranch<A, S extends A> = (value: A) => value is S
type MapBranch<A, S extends A, O> = (atom: Atom<S>) => O

export function match<A, S1 extends A, O>(
  atom: Atom<A>,
  match1: MatchBranch<A, S1>,
  map1: MapBranch<A, S1, O>,
  else_: MapBranch<A, Exclude<A, S1>, O>
): O
export function match<A, S1 extends A, S2 extends A, O>(
  atom: Atom<A>,
  match1: MatchBranch<A, S1>,
  map1: MapBranch<A, S1, O>,
  match2: MatchBranch<A, S2>,
  map2: MapBranch<A, S2, O>,
  else_: MapBranch<A, Exclude<A, S1 | S2>, O>
): O
export function match<A, S1 extends A, S2 extends A, S3 extends A, O>(
  atom: Atom<A>,
  match1: MatchBranch<A, S1>,
  map1: MapBranch<A, S1, O>,
  match2: MatchBranch<A, S2>,
  map2: MapBranch<A, S2, O>,
  match3: MatchBranch<A, S3>,
  map3: MapBranch<A, S3, O>,
  else_: MapBranch<A, Exclude<A, S1 | S2 | S3>, O>
): O
export function match<
  A,
  S1 extends A,
  S2 extends A,
  S3 extends A,
  S4 extends A,
  O
>(
  atom: Atom<A>,
  match1: MatchBranch<A, S1>,
  map1: MapBranch<A, S1, O>,
  match2: MatchBranch<A, S2>,
  map2: MapBranch<A, S2, O>,
  match3: MatchBranch<A, S3>,
  map3: MapBranch<A, S3, O>,
  match4: MatchBranch<A, S4>,
  map4: MapBranch<A, S4, O>,
  else_: MapBranch<A, Exclude<A, S1 | S2 | S3 | S4>, O>
): O
export function match<A>(atom: Atom<A>, ...fns: ((x: any) => any)[]) {
  const matchingBranch = (value: A) => {
    for (let i = 0; i < fns.length - 1; ) {
      const match = fns[i++]
      const map = fns[i++]
      if (match(value)) return { i, match, map }
    }
    return { i: fns.length, match: always, map: fns[fns.length - 1] }
  }

  const result = atom
    .skipDuplicates((left, right) => {
      return matchingBranch(left).i === matchingBranch(right).i
    })
    .flatMapLatest(value => {
      const { match, map } = matchingBranch(value)
      return map(atom.freezeUnless(match))
    })

  if ((atom as any).eager) {
    result.subscribe()
    ;(result as any).eager = true
  }
  //result.subscribe()
  return result
}

const always = () => true

export function definedOr<A, O>(
  atom: Atom<A | null | undefined>,
  map: (atom: Atom<A>) => O,
  else_: () => O
) {
  return match(atom, (x): x is A => x !== undefined && x !== null, map, else_)
}
