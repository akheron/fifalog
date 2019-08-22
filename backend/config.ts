import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { IntFromString } from 'io-ts-types/lib/IntFromString'
import { isLeft } from 'fp-ts/lib/Either'

const codec = t.partial({
  BIND_HOST: t.string,
  PORT: IntFromString,
  USERNAME: t.string,
  PASSWORD: t.string,
})

interface Config {
  bindHost: string
  port: number
  basicAuth: {
    name: string
    pass: string
  } | null
}

function configFromEnv(env: t.TypeOf<typeof codec>): Config {
  return {
    bindHost: env.BIND_HOST || '127.0.0.1',
    port: env.PORT || 3000,
    basicAuth:
      env.USERNAME && env.PASSWORD
        ? {
            name: env.USERNAME,
            pass: env.PASSWORD,
          }
        : null,
  }
}

const result = codec.decode(process.env)
if (isLeft(result)) {
  throw new Error(
    `Invalid environment variables: ${PathReporter.report(result)}`
  )
}

export default configFromEnv(result.right)
