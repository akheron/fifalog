import * as B from 'baconjs'
import * as H from 'harmaja'

type MatchBranch<A, S extends A> = (value: A) => value is S
type MapBranch<A, S extends A, O> = (atom: H.Atom<S>) => O

export function match<A, S1 extends A, O>(
  atom: H.Atom<A>,
  match1: MatchBranch<A, S1>,
  map1: MapBranch<A, S1, O>,
  else_: MapBranch<A, Exclude<A, S1>, O>
): O
export function match<A, S1 extends A, S2 extends A, O>(
  atom: H.Atom<A>,
  match1: MatchBranch<A, S1>,
  map1: MapBranch<A, S1, O>,
  match2: MatchBranch<A, S2>,
  map2: MapBranch<A, S2, O>,
  else_: MapBranch<A, Exclude<A, S1 | S2>, O>
): O
export function match<A, S1 extends A, S2 extends A, S3 extends A, O>(
  atom: H.Atom<A>,
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
  atom: H.Atom<A>,
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
export function match<A>(atom: H.Atom<A>, ...fns: ((x: any) => any)[]) {
  type Fn = (v: any) => any
  type Branch = { match: Fn; map: Fn; i: number }

  const last = fns.length - 1

  const branches: Branch[] = []
  for (let i = 0; i < fns.length - 1; i += 2) {
    branches.push({
      match: fns[i],
      map: fns[i + 1],
      i,
    })
  }

  const else_: Branch = {
    // Match if none of the other branches match
    match: (value: any) => !branches.some(b => b.match(value)),
    map: fns[last],
    i: last,
  }

  const matchingBranch = (value: A) =>
    branches.find(branch => branch.match(value)) ?? else_

  return atom
    .skipDuplicates(
      (left, right) => matchingBranch(left).i === matchingBranch(right).i
    )
    .flatMapLatest(value => {
      const { match, map } = matchingBranch(value)
      return map(atom.freezeUnless(match))
    })
}

export function definedOr<A, O>(
  atom: H.Atom<A | null | undefined>,
  map: (atom: H.Atom<A>) => O,
  else_: () => O
) {
  return match(atom, (x): x is A => x !== undefined && x !== null, map, else_)
}

export function editAtom<A>(source: B.Property<A>): H.Atom<A> {
  const localValue = H.atom<A | undefined>(undefined)
  const value = B.combine(source, localValue, (s, l) =>
    l !== undefined ? l : s
  )
  return H.atom(value, localValue.set)
}
