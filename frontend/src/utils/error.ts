import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export function getErrorStatus(
  error: FetchBaseQueryError | SerializedError | undefined
): number | undefined {
  if (
    error !== undefined &&
    'status' in error &&
    typeof error.status === 'number'
  ) {
    return error.status
  }
  return undefined
}
