import * as B from 'baconjs'
import { Atom, onUnmount } from 'harmaja'
import * as A from './atom-utils'

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

export const isNotStarted_ = (
  state: EffectState<any, any>
): state is NotStarted => state.kind === 'NotStarted'

export const isPending_ = (state: EffectState<any, any>): state is Pending =>
  state.kind === 'Pending'

export const isSuccess_ = <T>(
  state: EffectState<any, T>
): state is Success<T> => state.kind === 'Success'

export const isError_ = <E>(state: EffectState<E, any>): state is Error<E> =>
  state.kind === 'Error'

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

export const match = <A, E, T, O>(
  effect: Effect<A, E, T>,
  mapPending: () => O,
  mapSuccess: (value: B.Property<T>) => O,
  mapError: (error: B.Property<E>) => O
) =>
  A.match(
    A.editAtom(effect.state), // TODO: Fix A.match to work on properties

    isSuccess_,
    successAtom => mapSuccess(successAtom.view('value')),

    isError_,
    errorAtom => mapError(errorAtom.view('error')),

    mapPending
  )

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

export function sync<A, E, T>(
  effect: Effect<A, E, T>,
  target: Atom<EffectState<E, T>>
): void {
  onUnmount(effect.state.onValue(effectState => target.set(effectState)))
}

export function syncSuccess<A, E, T>(
  effect: Effect<A, E, T>,
  target: Atom<T>
): void
export function syncSuccess<A, E, T, U>(
  effect: Effect<A, E, T>,
  update: (current: U, next: T) => U,
  target: Atom<U>
): void
export function syncSuccess<A, E, T, U>(
  effect: Effect<A, E, T>,
  ...rest: any[]
): void {
  let update: (current: U, next: T) => U
  let target: Atom<U>
  if (rest.length === 1) {
    update = identity2 as any
    target = rest[0]
  } else {
    update = rest[0]
    target = rest[1]
  }
  onUnmount(
    onSuccess(effect, next => target.modify(current => update(current, next)))
  )
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

//

export type EffectConstructor<A, E, T> = () => Effect<A, E, T>

function makeEffectConstructor<A, E, T>(
  run: (bus: B.Bus<EffectState<E, T>>, arg: A) => void
): EffectConstructor<A, E, T> {
  return () => {
    const bus = new B.Bus<EffectState<E, T>>()
    return {
      run: (arg: A) => run(bus, arg),
      state: bus.toProperty(notStarted()),
    }
  }
}

export const map = <T, U>(fn: (value: T) => U) => <A, E>(
  ctor: EffectConstructor<A, E, T>
): EffectConstructor<A, E, U> => () => {
  const effect = ctor()
  return {
    run: effect.run,
    state: effect.state.map(state => {
      if (state.kind === 'Success') {
        return success(fn(state.value))
      }
      return state
    }),
  }
}

export const mapArg = <A, B>(fn: (arg: B) => A) => <E, T>(
  ctor: EffectConstructor<A, E, T>
): EffectConstructor<B, E, T> => () => {
  const effect = ctor()
  return {
    run: (arg: B) => effect.run(fn(arg)),
    state: effect.state,
  }
}

export function fromPromise<A, T>(
  fn: () => Promise<T>
): () => Effect<void, void, T>
export function fromPromise<A, T>(
  fn: (arg: A) => Promise<T>
): () => Effect<A, void, T>
export function fromPromise<A, T>(
  fn: (arg: A) => Promise<T>
): EffectConstructor<A, void, T> {
  return makeEffectConstructor((bus, arg) => {
    bus.push(pending())
    bus.plug(
      B.fromPromise(fn(arg))
        .map<EffectState<void, T>>(success)
        .mapError(error<void, T>(undefined))
    )
  })
}

function par<A1, E1, T1, A2, E2, T2>(
  first: EffectConstructor<A1, E1, T1>,
  second: EffectConstructor<A2, E2, T2>
): EffectConstructor<readonly [A1, A2], E1 | E2, readonly [T1, T2]> {
  const e1 = first()
  const e2 = second()
  return makeEffectConstructor((bus, [arg1, arg2]) => {
    let done = false
    e1.run(arg1)
    e2.run(arg2)
    bus.push(pending())
    bus.plug(
      B.combine(
        e1.state,
        e2.state,
        (s1, s2) => [s1, s2] as const
      ).flatMapLatest(([s1, s2]):
        | EffectState<E1 | E2, [T1, T2]>
        | B.EventStream<EffectState<E1 | E2, [T1, T2]>> => {
        if (done) return B.never<EffectState<E1 | E2, [T1, T2]>>()
        done = true
        if (s1.kind === 'Error') return s1
        if (s2.kind === 'Error') return s2
        if (s1.kind === 'Success' && s2.kind === 'Success')
          return success([s1.value, s2.value])
        done = false
        return B.never<EffectState<E1 | E2, [T1, T2]>>()
      })
    )
  })
}

export function parallel<A1, E1, T1, A2, E2, T2>(
  first: EffectConstructor<A1, E1, T1>,
  second: EffectConstructor<A2, E2, T2>
): EffectConstructor<[A1, A2], E1 | E2, [T1, T2]>
export function parallel<A1, E1, T1, A2, E2, T2, A3, E3, T3>(
  first: EffectConstructor<A1, E1, T1>,
  second: EffectConstructor<A2, E2, T2>,
  third: EffectConstructor<A3, E3, T3>
): EffectConstructor<[A1, A2, A3], E1 | E2 | E3, [T1, T2, T3]>
export function parallel<A1, E1, T1, A2, E2, T2, A3, E3, T3, A4, E4, T4>(
  first: EffectConstructor<A1, E1, T1>,
  second: EffectConstructor<A2, E2, T2>,
  third: EffectConstructor<A3, E3, T3>,
  fourth: EffectConstructor<A4, E4, T4>
): EffectConstructor<[A1, A2, A3, A4], E1 | E2 | E3 | E4, [T1, T2, T3, T4]>
export function parallel<A1, E1, T1, A2, E2, T2, A3, E3, T3, A4, E4, T4>(
  first: EffectConstructor<A1, E1, T1>,
  second: EffectConstructor<A2, E2, T2>,
  third?: EffectConstructor<A3, E3, T3>,
  fourth?: EffectConstructor<A4, E4, T4>
):
  | EffectConstructor<readonly [A1, A2], E1 | E2, readonly [T1, T2]>
  | EffectConstructor<
      readonly [A1, A2, A3],
      E1 | E2 | E3,
      readonly [T1, T2, T3]
    >
  | EffectConstructor<
      readonly [A1, A2, A3, A4],
      E1 | E2 | E3 | E4,
      readonly [T1, T2, T3, T4]
    > {
  switch (arguments.length) {
    case 2:
      return par(first, second)
    case 3:
      return pipe(
        par(par(first, second), third!),
        map(([[t1, t2], t3]) => [t1, t2, t3] as const),
        mapArg(([a1, a2, a3]: [A1, A2, A3]) => [[a1, a2], a3] as const)
      )
    default:
      return pipe(
        par(par(par(first, second), third!), fourth!),
        map(([[[t1, t2], t3], t4]) => [t1, t2, t3, t4] as const),
        mapArg(
          ([a1, a2, a3, a4]: [A1, A2, A3, A4]) => [[[a1, a2], a3], a4] as const
        )
      )
  }
}

// Taken from fp-ts
export function pipe<A>(a: A): A
export function pipe<A, B>(a: A, ab: (a: A) => B): B
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
export function pipe<A, B, C, D>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D
): D
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E
): E
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F
): F
export function pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G
): G
export function pipe<A, B, C, D, E, F, G, H>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H
): H
export function pipe<A, B, C, D, E, F, G, H, I>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
  hi: (h: H) => I
): I
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
  hi: (h: H) => I,
  ij: (i: I) => J
): J
export function pipe(
  a: unknown,
  ab?: Function,
  bc?: Function,
  cd?: Function,
  de?: Function,
  ef?: Function,
  fg?: Function,
  gh?: Function,
  hi?: Function,
  ij?: Function
): unknown {
  switch (arguments.length) {
    case 1:
      return a
    case 2:
      return ab!(a)
    case 3:
      return bc!(ab!(a))
    case 4:
      return cd!(bc!(ab!(a)))
    case 5:
      return de!(cd!(bc!(ab!(a))))
    case 6:
      return ef!(de!(cd!(bc!(ab!(a)))))
    case 7:
      return fg!(ef!(de!(cd!(bc!(ab!(a))))))
    case 8:
      return gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))))
    case 9:
      return hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))))
    case 10:
      return ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))))))
  }
  return
}

//

const identity2 = <T, U>(_x: U, y: T): T => y
