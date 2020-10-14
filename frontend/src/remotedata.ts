import * as B from 'baconjs'
import { Atom } from 'harmaja'
import * as A from './atom-utils'

export type Loading = { kind: 'Loading' }
export type Success<T> = { kind: 'Success'; value: T }
export type Error = { kind: 'Error' }
export type RemoteData<T> = Loading | Success<T> | Error

export const loading = <T>(): RemoteData<T> => ({ kind: 'Loading' })
export const success = <T>(value: T): RemoteData<T> => ({
  kind: 'Success',
  value,
})
export const error = <T>(): RemoteData<T> => ({ kind: 'Error' })

export const isLoading = <T>(rd: RemoteData<T>): rd is Loading =>
  rd.kind === 'Loading'
export const isSuccess = <T>(rd: RemoteData<T>): rd is Success<T> =>
  rd.kind === 'Success'
export const isError = <T>(rd: RemoteData<T>): rd is Error =>
  rd.kind === 'Error'

export const match = <T, O>(
  data: Atom<RemoteData<T>>,
  mapLoading: () => O,
  mapSuccess: (value: Atom<T>) => O,
  mapError: () => O
) =>
  A.match(
    data,

    isLoading,
    mapLoading,

    isSuccess,
    rd => mapSuccess(rd.view('value')),

    mapError
  )

export const fromEventStream = <T>(
  eventStream: B.EventStream<T>
): B.Property<RemoteData<T>> =>
  eventStream
    .map(success)
    .mapError(error)
    .toProperty(loading())

export const fromPromise = <T>(
  promise: Promise<T>
): B.Property<RemoteData<T>> => fromEventStream(B.fromPromise(promise))
