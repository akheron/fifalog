import * as B from 'baconjs'
import { Atom, onUnmount } from 'harmaja'
import { Effect, EffectConstructor, EffectState, notStarted } from './effect'

interface ForkedEffectConstructor<A1 extends string | number, A2, E, T> {
  (arg: A1): Effect<A2, E, T>
  updates: B.Observable<EffectUpdate<A1, E, T>>
  state: B.Property<RootEffectState<A1, E, T>>
}

type RootEffectState<A1 extends string | number, E, T> = Partial<
  Record<A1, EffectState<E, T>>
>

interface EffectUpdate<A1 extends string | number, E, T> {
  arg: A1
  effectState: EffectState<E, T>
}

export function fork<A extends string | number, E, T>(
  ctor: EffectConstructor<A, E, T>
): ForkedEffectConstructor<A, void, E, T>
export function fork<A, A1 extends string | number, A2, E, T>(
  ctor: EffectConstructor<A, E, T>,
  joinArg: (arg1: A1) => (arg2: A2) => A
): ForkedEffectConstructor<A1, A2, E, T>
export function fork<A, A1 extends string | number, A2, E, T>(
  ctor: EffectConstructor<A, E, T>,
  joinArg?: (part1: A1) => (part2: A2) => A
): ForkedEffectConstructor<A1, A2, E, T> {
  const updates = new B.Bus<EffectUpdate<A1, E, T>>()
  const resets = new B.Bus<A1>()
  const state = B.update<RootEffectState<A1, E, T>>(
    {},
    [
      updates,
      (s, u: EffectUpdate<A1, E, T>) => ({ ...s, [u.arg]: u.effectState }),
    ],
    [
      resets,
      (s, arg: A1) => {
        const nextState = { ...s }
        delete nextState[arg]
        return nextState
      },
    ]
  )
  const result = (part1: A1): Effect<A2, E, T> => {
    const effect = ctor()
    const argJoiner: (part2: A2) => A = (joinArg
      ? joinArg(part1)
      : always(part1)) as any
    updates.plug(
      effect.state
        .skipDuplicates()
        .map(effectState => ({ arg: part1, effectState }))
    )
    return {
      run: (part2: A2) => effect.run(argJoiner(part2)),
      state: state.map(s => s[part1] ?? notStarted<E, T>()).skipDuplicates(),
      reset: () => {
        resets.push(part1)
      },
    }
  }
  result.updates = updates
  result.state = state
  return result
}

export function syncSuccess<A1 extends string | number, A2, E, T>(
  ctor: ForkedEffectConstructor<A1, A2, E, T>,
  target: Atom<T>
): void
export function syncSuccess<A1 extends string | number, A2, E, T, U>(
  ctor: ForkedEffectConstructor<A1, A2, E, T>,
  update: (current: U, arg: A1, next: T) => U,
  target: Atom<U>
): void
export function syncSuccess<A1 extends string | number, A2, E, T, U>(
  ctor: ForkedEffectConstructor<A1, A2, E, T>,
  ...rest: any[]
): void {
  let update: (current: U, arg: A1, next: T) => U
  let target: Atom<U>
  if (rest.length === 1) {
    update = identity3 as any
    target = rest[0]
  } else {
    update = rest[0]
    target = rest[1]
  }
  onUnmount(
    ctor.updates.onValue(({ arg, effectState }) => {
      if (effectState.kind === 'Success') {
        target.modify(current => update(current, arg, effectState.value))
      }
    })
  )
}

//

const always = <T>(x: T) => () => x
const identity3 = <T, U, V>(_x: V, _y: U, z: T): T => z
