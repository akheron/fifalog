import * as Option from 'fp-ts/lib/Option'
import * as t from 'io-ts'
import { Route, Parser, Response, URL, route, router } from 'typera-koa'
import * as R from 'ramda'

import { DBClient } from './db'
import { matchResultBody } from '../../common/codecs'
import { League, Match, User, Stats } from '../../common/types'
import { getRandomMatch } from './teams'

export default (db: DBClient) => {
  const users: Route<Response.Ok<User[]>> = route('get', '/users')()(
    async () => {
      return Response.ok(await db.users())
    }
  )

  const leagues: Route<Response.Ok<League[]>> = route('get', '/leagues')()(
    async () => {
      return Response.ok(await db.leagues())
    }
  )

  const matches: Route<Response.Ok<Match[]>> = route('get', '/matches')()(
    async () => {
      return Response.ok(await db.latestMatches(20))
    }
  )

  const deleteMatch: Route<
    Response.NoContent | Response.BadRequest<string> | Response.NotFound
  > = route('delete', '/matches/', URL.int('id'))()(async req => {
    const result = await db.deleteMatch(req.routeParams.id)

    if (result) return Response.noContent()
    return Response.badRequest('This match cannot be deleted')
  })

  const finishMatch: Route<
    Response.Ok<Match> | Response.BadRequest<string> | Response.NotFound
  > = route('put', '/matches/', URL.int('id'), '/finish')(
    Parser.body(matchResultBody)
  )(async req => {
    const match = await db.finishMatch(req.routeParams.id, req.body)
    if (!match) return Response.notFound()
    return Response.ok(match)
  })

  const randomMatchPairBody = t.type({ userIds: t.tuple([t.number, t.number]) })

  const createRandomMatchPair: Route<
    Response.Ok<[Match, Match]> | Response.BadRequest<string>
  > = route('post', '/matches/random_pair')(Parser.body(randomMatchPairBody))(
    async req => {
      const userIds = req.body.userIds
      if (userIds[0] === userIds[1])
        return Response.badRequest('User ids must be inequal')

      const randomMatchOption = getRandomMatch(await db.leagues())
      if (Option.isNone(randomMatchOption)) {
        return Response.badRequest('No teams defined in database')
      }
      const randomMatch = randomMatchOption.value

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
    }
  )

  const stats: Route<Response.Ok<Stats[]>> = route('get', '/stats')()(
    async () => {
      const lastUserStats = await db.userStats(10)
      const lastTotalStats = await db.totalStats(10)
      const userStats = R.groupWith(
        R.eqProps('month'),
        await db.userStats(null)
      )
      const totalStats = await db.totalStats(null)

      let result: Stats[] = []
      if (lastTotalStats.length) {
        const last = lastTotalStats[0]
        result.push({
          month: last.month,
          ties: last.ties,
          matches: last.matches,
          goals: last.goals,
          userStats: lastUserStats,
        })
      }

      result = result.concat(
        R.zip(userStats, totalStats).map(([users, total]) => ({
          month: total.month,
          ties: total.ties,
          matches: total.matches,
          goals: total.goals,
          userStats: users,
        }))
      )

      return Response.ok(result)
    }
  )

  return router(
    users,
    leagues,
    matches,
    deleteMatch,
    finishMatch,
    createRandomMatchPair,
    stats
  ).handler()
}
