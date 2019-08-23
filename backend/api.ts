import * as Router from 'koa-router'
import { RouteHandler, Parser, Response, routeHandler, run } from 'typera-koa'

import { DBClient } from './db'
import { League } from '../common/types'

export default (db: DBClient) => {
  const router = new Router({ prefix: '/api' })

  const leagues: RouteHandler<Response.Ok<League[]>> = routeHandler()(
    async () => {
      return Response.ok(await db.leagues())
    }
  )

  router.get('/leagues', run(leagues))

  return router
}
