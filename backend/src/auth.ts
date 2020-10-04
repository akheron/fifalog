import * as t from 'io-ts'
import * as koa from 'koa'
import { Middleware, Parser, Response, Route, route, router } from 'typera-koa'
import config from './config'

if (!config.auth && config.env === 'production') {
  throw new Error(
    'USERNAME, PASSWORD and SECRETS env variables are required in production mode'
  )
}

function maybeInitAuth(app: koa) {
  if (!config.auth) return
  if (!app.keys) {
    app.keys = config.auth.secrets
  }
}

export function validateAuth(ctx: koa.Context): boolean {
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

const loginBody = t.type({
  username: t.string,
  password: t.string,
})

const login: Route<Response.Ok | Response.BadRequest<string>> = route.post(
  '/login'
)(Parser.body(loginBody))(req => {
  if (!config.auth)
    return Response.badRequest('Session functionality is disabled')

  if (
    req.body.username === config.auth.username &&
    req.body.password === config.auth.password
  ) {
    maybeInitAuth(req.ctx.app)
    req.ctx.cookies.set('session', (+new Date()).toString(), {
      signed: true,
      secure: req.ctx.protocol === 'https',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 2 weeks in ms
      overwrite: true,
    })
    return Response.ok()
  }
  return Response.badRequest('Invalid username or password')
})

const logout: Route<Response.Ok> = route.get('/logout')()(req => {
  req.ctx.cookies.set('session')
  return Response.ok()
})

export const authRouter = router(login, logout).handler()
