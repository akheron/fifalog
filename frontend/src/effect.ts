import * as B from 'baconjs'

export type EffectState<E, T> = NotStarted | Pending | Success<T> | Error<E>

export type NotStarted = { kind: 'NotStarted' }
export type Pending = { kind: 'Pending' }
export type Success<T> = { kind: 'Success'; value: T }
export type Error<E> = { kind: 'Error'; error: E }

export const notStarted = <E, T>(): EffectState<E, T> => ({
  kind: 'NotStarted',
})
export const pending = <E, T>(): EffectState<E, T> => ({ kind: 'Pending' })
export const success = <E, T>(value: T): EffectState<E, T> => ({
  kind: 'Success',
  value,
})
export const error = <E, T>(error: E): EffectState<E, T> => ({
  kind: 'Error',
  error,
})

export interface Effect<A, E, T> {
  run(arg: A): void
  state: B.Property<EffectState<E, T>>
}

export function run<E, T>(effect: Effect<void, E, T>): void
export function run<A, E, T>(effect: Effect<A, E, T>, arg: A): void
export function run<A, E, T>(effect: Effect<A, E, T>, arg?: A): void {
  effect.run(arg as any)
}

export function state<E, T>(
  effect: Effect<any, E, T>
): B.Property<EffectState<E, T>> {
  return effect.state
}

export function isSuccess(effect: Effect<any, any, any>): B.Property<boolean> {
  return effect.state.map(s => s.kind === 'Success')
}

export function ifSuccess<T, U>(
  effect: Effect<any, any, T>,
  then_: (value: T) => U,
  else_: () => U
): B.Property<U> {
  return effect.state.map(s =>
    s.kind === 'Success' ? then_(s.value) : else_()
  )
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

export function onError<A, E, T>(
  effect: Effect<A, E, T>,
  then_: (error: E) => void
): B.Unsub {
  return effect.state.onValue(s => {
    if (s.kind === 'Error') {
      then_(s.error)
    }
  })
}

export function isPending(effect: Effect<any, any, any>): B.Property<boolean> {
  return effect.state.map(s => s.kind === 'Pending')
}

export function ifPending<U>(
  effect: Effect<any, any, any>,
  then_: () => U,
  else_: () => U
): B.Property<U> {
  return effect.state.map(s => (s.kind === 'Pending' ? then_() : else_()))
}

export function isError(effect: Effect<any, any, any>): B.Property<boolean> {
  return effect.state.map(s => s.kind === 'Error')
}

export function ifError<E, U>(
  effect: Effect<any, E, any>,
  then_: (error: E) => U,
  else_: () => U
): B.Property<U> {
  return effect.state.map(s => (s.kind === 'Error' ? then_(s.error) : else_()))
}

export function fromPromise<A, T>(fn: () => Promise<T>): Effect<void, void, T>
export function fromPromise<A, T>(
  fn: (arg: A) => Promise<T>
): Effect<A, void, T>
export function fromPromise<A, T>(
  fn: (arg: A) => Promise<T>
): Effect<A, void, T> {
  const bus = new B.Bus<EffectState<void, T>>().log('fromPromise bus')
  const run = (arg: A) => {
    bus.push(pending())
    bus.plug(
      B.fromPromise(fn(arg))
        .map<EffectState<void, T>>(success)
        .mapError(error(undefined))
    )
  }
  return {
    run,
    state: bus.toProperty(notStarted()),
  }
}
