import * as t from 'io-ts'
import { Parser, Response, Route, route, router } from 'typera-koa'
import { maybeInitAuth } from '../auth'
import config from '../config'

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
