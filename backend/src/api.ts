import * as Option from 'fp-ts/lib/Option'
import * as t from 'io-ts'
import {
  Route,
  Parser,
  Response,
  URL,
  applyMiddleware,
  router,
} from 'typera-koa'
import * as R from 'ramda'

import { auth } from './auth'
import { db } from './db'
import { matchResultBody } from '../../common/codecs'
import { League, Match, User, Stats } from '../../common/types'
import { getRandomMatch } from './teams'

const route = applyMiddleware(auth, db)

const users: Route<
  Response.Ok<User[]> | Response.Unauthorized<string>
> = route.get('/users')(db)(async req => {
  return Response.ok(await req.db.users())
})

const leagues: Route<
  Response.Ok<League[]> | Response.Unauthorized<string>
> = route.get('/leagues')(db)(async req => {
  return Response.ok(await req.db.leagues())
})

const matches: Route<
  Response.Ok<Match[]> | Response.Unauthorized<string>
> = route.get('/matches')(db)(async req => {
  return Response.ok(await req.db.latestMatches(20))
})

const deleteMatch: Route<
  | Response.NoContent
  | Response.BadRequest<string>
  | Response.Unauthorized<string>
  | Response.NotFound
> = route.delete('/matches/', URL.int('id'))(db)(async req => {
  const result = await req.db.deleteMatch(req.routeParams.id)

  if (result) return Response.noContent()
  return Response.badRequest('This match cannot be deleted')
})

const finishMatch: Route<
  | Response.Ok<Match>
  | Response.BadRequest<string>
  | Response.Unauthorized<string>
  | Response.NotFound
> = route.put('/matches/', URL.int('id'), '/finish')(
  db,
  Parser.body(matchResultBody)
)(async req => {
  const match = await req.db.finishMatch(req.routeParams.id, req.body)
  if (!match) return Response.notFound()
  return Response.ok(match)
})

const randomMatchPairBody = t.type({ userIds: t.tuple([t.number, t.number]) })

const createRandomMatchPair: Route<
  | Response.Ok<[Match, Match]>
  | Response.BadRequest<string>
  | Response.Unauthorized<string>
> = route.post('/matches/random_pair')(db, Parser.body(randomMatchPairBody))(
  async req => {
    const userIds = req.body.userIds
    if (userIds[0] === userIds[1])
      return Response.badRequest('User ids must be inequal')

    const randomMatchOption = getRandomMatch(await req.db.leagues())
    if (Option.isNone(randomMatchOption)) {
      return Response.badRequest('No teams defined in database')
    }
    const randomMatch = randomMatchOption.value

    const match1 = await req.db.createMatch({
      ...randomMatch,
      homeUserId: userIds[0],
      awayUserId: userIds[1],
    })
    const match2 = await req.db.createMatch({
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

const stats: Route<
  Response.Ok<Stats[]> | Response.Unauthorized<string>
> = route.get('/stats')(db)(async req => {
  const lastUserStats = await req.db.userStats(10)
  const lastTotalStats = await req.db.totalStats(10)
  const userStats = R.groupWith(
    R.eqProps('month'),
    await req.db.userStats(null)
  )
  const totalStats = await req.db.totalStats(null)

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
})

export const apiRouter = router(
  users,
  leagues,
  matches,
  deleteMatch,
  finishMatch,
  createRandomMatchPair,
  stats
).handler()
