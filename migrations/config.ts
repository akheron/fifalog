import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { BooleanFromString } from 'io-ts-types/lib/BooleanFromString'
import { isLeft } from 'fp-ts/lib/Either'

const codec = t.intersection([
  t.type({ DATABASE_URL: t.string }),
  t.partial({
    DATABASE_FORCE_SSL: BooleanFromString,
  }),
])

interface Config {
  databaseUrl: string
  databaseForceSsl: boolean
}

function configFromEnv(env: t.TypeOf<typeof codec>): Config {
  return {
    databaseUrl: env.DATABASE_URL,
    databaseForceSsl: env.DATABASE_FORCE_SSL ?? false,
  }
}

const result = codec.decode(process.env)
if (isLeft(result)) {
  throw new Error(
    `Invalid environment variables: ${PathReporter.report(result)}`
  )
}

export default configFromEnv(result.right)
