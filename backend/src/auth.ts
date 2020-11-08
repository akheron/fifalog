import * as Koa from 'koa'
import { Middleware, Response } from 'typera-koa'
import config from './config'

if (!config.auth && config.env === 'production') {
  throw new Error(
    'USERNAME, PASSWORD and SECRETS env variables are required in production mode'
  )
}

export function maybeInitAuth(app: Koa) {
  if (!config.auth) return
  if (!app.keys) {
    app.keys = config.auth.secrets
  }
}

export function validateAuth(ctx: Koa.Context): boolean {
  if (!config.auth) return true
  maybeInitAuth(ctx.app)
  return ctx.cookies.get('session', { signed: true }) != null
}

export const auth: Middleware.Middleware<
  unknown,
  Response.Unauthorized<string>
> = req => {
  if (validateAuth(req.ctx)) {
    return Middleware.next()
  }
  return Middleware.stop(Response.unauthorized('Unauthorized'))
}
