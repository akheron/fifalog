import * as t from 'io-ts'
import { IntFromString } from 'io-ts-types/lib/IntFromString'
import * as Router from 'koa-router'
import { RouteHandler, Parser, Response, routeHandler, run } from 'typera-koa'

import { DBClient } from './db'
import { League, SavedMatch, User } from '../common/types'
import { getRandomMatch } from './teams'

export default (db: DBClient) => {
  const router = new Router({ prefix: '/api' })

  const users: RouteHandler<Response.Ok<User[]>> = routeHandler()(async () => {
    return Response.ok(await db.users())
  })

  const leagues: RouteHandler<Response.Ok<League[]>> = routeHandler()(
    async () => {
      return Response.ok(await db.leagues())
    }
  )

  const matches: RouteHandler<Response.Ok<SavedMatch[]>> = routeHandler()(
    async () => {
      return Response.ok(await db.latestMatches(20))
    }
  )

  const id = t.type({ id: IntFromString })

  const deleteMatch: RouteHandler<
    Response.NoContent | Response.BadRequest<string> | Response.NotFound
  > = routeHandler(Parser.routeParams(id))(async req => {
    const result = await db.deleteMatch(req.routeParams.id)

    if (result) return Response.noContent()
    return Response.badRequest('This match cannot be deleted')
  })

  const randomMatchPairBody = t.type({ userIds: t.tuple([t.number, t.number]) })

  const createRandomMatchPair: RouteHandler<
    Response.Ok<[SavedMatch, SavedMatch]> | Response.BadRequest<string>
  > = routeHandler(Parser.body(randomMatchPairBody))(async req => {
    const userIds = req.body.userIds
    if (userIds[0] === userIds[1])
      return Response.badRequest('User ids must be inequal')

    const randomMatch = getRandomMatch(await db.leagues())

    const match1 = await db.createMatch({
      ...randomMatch,
      homeUserId: userIds[0],
      awayUserId: userIds[1],
    })
    const match2 = await db.createMatch({
      ...randomMatch,
      homeUserId: userIds[1],
      awayUserId: userIds[0],
    })
    if (!match1 || !match2) {
      return Response.badRequest(
        'At least one of the supplied user ids does not exist'
      )
    }
    return Response.ok<[SavedMatch, SavedMatch]>([match1, match2])
  })

  router.get('/users', run(users))
  router.get('/leagues', run(leagues))
  router.get('/matches', run(matches))
  router.delete('/matches/:id', run(deleteMatch))
  router.post('/matches/random_pair', run(createRandomMatchPair))

  return router
}
