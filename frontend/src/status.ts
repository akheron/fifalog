import { Atom } from 'harmaja'

export type Status = 'idle' | 'loading' | 'error'

export async function trackStatus<T>(
  promise: Promise<T> | (() => Promise<T>),
  status: Atom<Status>,
): Promise<T> {
  status.set('loading')
  try {
    const result = await (typeof promise === 'function' ? promise() : promise)
    status.set('idle')
    return result
  } catch (_err) {
    status.set('error')
    throw _err
  }
}
