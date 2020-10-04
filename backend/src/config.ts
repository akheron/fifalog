import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { IntFromString } from 'io-ts-types/lib/IntFromString'
import { isLeft } from 'fp-ts/lib/Either'

const codec = t.intersection([
  t.type({ DATABASE_URL: t.string }),
  t.partial({
    NODE_ENV: t.string,
    BIND_HOST: t.string,
    PORT: IntFromString,
    USERNAME: t.string,
    PASSWORD: t.string,
    SECRETS: t.string,
  }),
])

interface Config {
  env: string
  bindHost: string
  port: number
  auth: {
    username: string
    password: string
    secrets: string[]
  } | null
  databaseUrl: string
}

function configFromEnv(env: t.TypeOf<typeof codec>): Config {
  return {
    env: env.NODE_ENV || 'development',
    bindHost: env.BIND_HOST || '127.0.0.1',
    port: env.PORT || 3000,
    auth:
      env.USERNAME && env.PASSWORD && env.SECRETS
        ? {
            username: env.USERNAME,
            password: env.PASSWORD,
            secrets: env.SECRETS.split(','),
          }
        : null,
    databaseUrl: env.DATABASE_URL,
  }
}

const result = codec.decode(process.env)
if (isLeft(result)) {
  throw new Error(
    `Invalid environment variables: ${PathReporter.report(result)}`
  )
}

export default configFromEnv(result.right)
