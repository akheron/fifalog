export async function onIntegrityError<E, A>(
  errorValue: E,
  query: Promise<A>
): Promise<E | A> {
  try {
    return await query
  } catch (error) {
    if (error.code && isIntegrityError(error.code)) {
      return errorValue
    }
    throw error
  }
}

const isIntegrityError = (sqlState: string): boolean =>
  sqlState.indexOf('23') === 0
