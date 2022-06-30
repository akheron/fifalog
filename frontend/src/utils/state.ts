import { useCallback, useState } from 'react'

export interface BooleanState {
  value: boolean
  on: () => void
  off: () => void
  toggle: () => void
}

export function useBooleanState(initialValue: boolean): BooleanState {
  const [value, setValue] = useState(initialValue)
  return {
    value,
    on: useCallback(() => setValue(true), []),
    off: useCallback(() => setValue(false), []),
    toggle: useCallback(() => setValue((prev) => !prev), []),
  }
}
