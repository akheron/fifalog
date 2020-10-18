import * as B from 'baconjs'
import { Atom, onUnmount } from 'harmaja'
import { Effect, EffectConstructor, EffectState } from './effect'

interface ForkedEffectConstructor<A1, A2, E, T> {
  (arg: A1): Effect<A2, E, T>
  state: B.Observable<ForkedEffectState<A1, E, T>>
}

interface ForkedEffectState<A, E, T> {
  arg: A
  effectState: EffectState<E, T>
}

export function fork<A, E, T>(
  ctor: EffectConstructor<A, E, T>
): ForkedEffectConstructor<A, void, E, T>
export function fork<A, A1, A2, E, T>(
  ctor: EffectConstructor<A, E, T>,
  joinArg: (arg1: A1) => (arg2: A2) => A
): ForkedEffectConstructor<A1, A2, E, T>
export function fork<A, A1, A2, E, T>(
  ctor: EffectConstructor<A, E, T>,
  joinArg?: (part1: A1) => (part2: A2) => A
): ForkedEffectConstructor<A1, A2, E, T> {
  const bus = new B.Bus<ForkedEffectState<A1, E, T>>()
  const result = (part1: A1) => {
    const effect = ctor()
    const argJoiner: (part2: A2) => A = (joinArg
      ? joinArg(part1)
      : always(part1)) as any
    bus.plug(effect.state.map(effectState => ({ arg: part1, effectState })))
    return {
      run: (part2: A2) => effect.run(argJoiner(part2)),
      state: effect.state,
    }
  }
  result.state = bus
  return result
}

export function onSuccess<A, E, T>(
  effect: Effect<A, E, T>,
  then_: (value: T) => void
): B.Unsub {
  return effect.state.onValue(s => {
    if (s.kind === 'Success') {
      then_(s.value)
    }
  })
}

export function sync<A1, A2, E, T>(
  ctor: ForkedEffectConstructor<A1, A2, E, T>,
  target: Atom<ForkedEffectState<A1, E, T>>
): void {
  onUnmount(ctor.state.onValue(effectState => target.set(effectState)))
}

export function syncSuccess<A1, A2, E, T>(
  ctor: ForkedEffectConstructor<A1, A2, E, T>,
  target: Atom<T>
): void
export function syncSuccess<A1, A2, E, T, U>(
  ctor: ForkedEffectConstructor<A1, A2, E, T>,
  update: (current: U, arg: A1, next: T) => U,
  target: Atom<U>
): void
export function syncSuccess<A1, A2, E, T, U>(
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
    ctor.state.onValue(({ arg, effectState }) => {
      if (effectState.kind === 'Success') {
        target.modify(current => update(current, arg, effectState.value))
      }
    })
  )
}

//

const always = <T>(x: T) => () => x
const identity3 = <T, U>(_x: U, y: T): T => y
