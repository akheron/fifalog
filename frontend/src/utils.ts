// import { Atom, ReadOnlyAtom, Lens } from '@grammarly/focal'
// import { AbstractAtom } from '@grammarly/focal/dist/_esm2015/src/atom/base'
// import { Subscriber, Subscription } from 'rxjs'

// export function modifyAtom<T>(atom: Atom<T>, mod: (prev: T) => T) {
//   return () => atom.modify(mod)
// }

// export function indexLens<T>(index: number): Lens<T[], T> {
//   const getter = (s: T[]) => s[index]
//   const setter =
//     index == 0
//       ? (v: T, s: T[]) => [v, ...s.slice(1)]
//       : (v: T, s: T[]) => [...s.slice(0, index), v, ...s.slice(index + 1)]

//   return Lens.create(getter, setter)
// }

// // An Atom that acts like the source atom, but doesn't emit null |
// // undefined values at all. Throws an error is the source has a null |
// // undefined value when constructed, so should only be used when the
// // non-nullness of source has been checked.
// //
// // Mostly copy-pasted from LensedAtom, as there's no common base
// // to extend in @grammarly/focal.
// //
// export class NonNullAtom<TSource> extends AbstractAtom<TSource> {
//   constructor(private _source: Atom<TSource | null | undefined>) {
//     // @NOTE this is a major hack to optimize for not calling
//     // _lens.get the extra time here. This makes the underlying
//     // BehaviorSubject to have an `undefined` for it's current value.
//     //
//     // But it works because before somebody subscribes to this
//     // atom, it will subscribe to the _source (which we expect to be a
//     // descendant of BehaviorSubject as well), which will emit a
//     // value right away, triggering our _onSourceValue.
//     super(undefined!)
//   }

//   get() {
//     // Optimization: in case we're already subscribed to the
//     // source atom, the BehaviorSubject.getValue will return
//     // an up-to-date computed lens value.
//     //
//     // This way we don't need to recalculate the lens value
//     // every time.
//     const result = this._subscription ? this.getValue() : this._source.get()
//     if (result == null) throw 'Should not happen!'
//     return result
//   }

//   modify(updateFn: (x: TSource) => TSource) {
//     this._source.modify((x: TSource | null | undefined) => {
//       if (x == null) throw 'Should not happen!'
//       return updateFn(x)
//     })
//   }

//   set(newValue: TSource) {
//     this._source.set(newValue)
//   }

//   private _onSourceValue(x: TSource | null | undefined) {
//     if (x != null) this.next(x)
//   }

//   private _subscription: Subscription | null = null
//   private _refCount = 0

//   // Rx method overrides
//   _subscribe(subscriber: Subscriber<TSource>) {
//     // tslint:disable-line function-name
//     if (!this._subscription) {
//       this._subscription = this._source.subscribe(x => this._onSourceValue(x))
//     }
//     this._refCount++

//     const sub = new Subscription(() => {
//       if (--this._refCount <= 0 && this._subscription) {
//         this._subscription.unsubscribe()
//         this._subscription = null
//       }
//     })
//     sub.add(super._subscribe(subscriber))

//     return sub
//   }

//   unsubscribe() {
//     if (this._subscription) {
//       this._subscription.unsubscribe()
//       this._subscription = null
//     }
//     this._refCount = 0

//     super.unsubscribe()
//   }
// }

// export function requireAtom<T, U, V>(
//   atom: Atom<T | null | undefined>,
//   defaultValue: U,
//   fn: (na: NonNullAtom<T>) => V
// ): ReadOnlyAtom<U | V> {
//   return atom.view(v => (v == null ? defaultValue : fn(new NonNullAtom(atom))))
// }
