import React, { ChangeEvent, useCallback, useMemo, useState } from 'react'

export interface FormState<T> {
  state: T
  setState: React.Dispatch<React.SetStateAction<T>>
}

export function useFormState<T>(initialState: T): FormState<T> {
  const [state, setState] = useState(initialState)
  return useMemo(() => ({ state, setState }), [state, setState])
}

export function useTextField<
  K extends keyof any,
  T extends { [KK in K]: string }
>(
  formState: FormState<T>,
  key: K
): [T[K], (e: ChangeEvent<HTMLInputElement>) => void] {
  const { state, setState } = formState
  const value = state[key]
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, [key]: e.target.value }))
  }, [])
  return [value, handleChange]
}

export function useSelect<T, K extends keyof T>(
  formState: FormState<T>,
  key: K
): [T[K], (e: ChangeEvent<HTMLSelectElement>) => void] {
  const { state, setState } = formState
  const value = state[key]
  const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setState((prev) => ({ ...prev, [key]: e.target.value }))
  }, [])
  return [value, handleChange]
}

export function useFormField<T, K extends keyof T>(
  formState: FormState<T>,
  key: K
): [T[K], (value: T[K]) => void] {
  const { state, setState } = formState
  const value = state[key]
  const handleChange = useCallback((value: T[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }, [])
  return [value, handleChange]
}
