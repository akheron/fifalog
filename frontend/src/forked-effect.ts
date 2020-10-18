import * as B from 'baconjs'
import { Atom, onUnmount } from 'harmaja'
import { Effect, EffectConstructor, EffectState } from './effect'

interface ForkedEffectConstructor<A, E, T> {
  (arg: A): Effect<void, E, T>
  state: B.Observable<ForkedEffectState<A, E, T>>
}

interface ForkedEffectState<A, E, T> {
  arg: A
  effectState: EffectState<E, T>
}

export function fork<A, E, T>(
  ctor: EffectConstructor<A, E, T>
): ForkedEffectConstructor<A, E, T> {
  const bus = new B.Bus<ForkedEffectState<A, E, T>>()
  const result = (arg: A) => {
    const effect = ctor()
    bus.plug(effect.state.map(effectState => ({ arg, effectState })))
    return {
      run: () => effect.run(arg),
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

export function sync<A, E, T>(
  ctor: ForkedEffectConstructor<A, E, T>,
  target: Atom<ForkedEffectState<A, E, T>>
): void {
  onUnmount(ctor.state.onValue(effectState => target.set(effectState)))
}

export function syncSuccess<A, E, T>(
  ctor: ForkedEffectConstructor<A, E, T>,
  target: Atom<T>
): void
export function syncSuccess<A, E, T, U>(
  ctor: ForkedEffectConstructor<A, E, T>,
  update: (current: U, arg: A, next: T) => U,
  target: Atom<U>
): void
export function syncSuccess<A, E, T, U>(
  ctor: ForkedEffectConstructor<A, E, T>,
  ...rest: any[]
): void {
  let update: (current: U, arg: A, next: T) => U
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

const identity3 = <T, U>(_x: U, y: T): T => y
