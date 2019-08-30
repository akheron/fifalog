import * as t from 'io-ts'
import { IntFromString } from 'io-ts-types/lib/IntFromString'
import * as Router from 'koa-router'
import { RouteHandler, Parser, Response, routeHandler, run } from 'typera-koa'
import * as R from 'ramda'

import { DBClient } from './db'
import { matchResultBody } from '../common/codecs'
import { League, Match, User, Stats } from '../common/types'
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

  const matches: RouteHandler<Response.Ok<Match[]>> = routeHandler()(
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

  const finishMatch: RouteHandler<
    Response.Ok<Match> | Response.BadRequest<string> | Response.NotFound
  > = routeHandler(Parser.routeParams(id), Parser.body(matchResultBody))(
    async req => {
      const match = await db.finishMatch(req.routeParams.id, req.body)
      if (!match) return Response.notFound()
      return Response.ok(match)
    }
  )

  const randomMatchPairBody = t.type({ userIds: t.tuple([t.number, t.number]) })

  const createRandomMatchPair: RouteHandler<
    Response.Ok<[Match, Match]> | Response.BadRequest<string>
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
    return Response.ok<[Match, Match]>([match2, match1])
  })

  const stats: RouteHandler<Response.Ok<Stats[]>> = routeHandler()(async () => {
    const userStats = R.groupWith(R.eqProps('month'), await db.userStats())
    const totalStats = await db.totalStats()

    return Response.ok(
      R.zip(userStats, totalStats).map(([users, total]) => ({
        month: total.month,
        ties: total.ties,
        matches: total.matches,
        userStats: users.map(({ user, wins, overTimeWins }) => ({
          user,
          wins,
          overTimeWins,
        })),
      }))
    )
  })

  router.get('/users', run(users))
  router.get('/leagues', run(leagues))
  router.get('/matches', run(matches))
  router.delete('/matches/:id', run(deleteMatch))
  router.put('/matches/:id/finish', run(finishMatch))
  router.post('/matches/random_pair', run(createRandomMatchPair))
  router.get('/stats', run(stats))

  return router
}
