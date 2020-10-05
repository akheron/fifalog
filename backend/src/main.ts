import * as dotenv from 'dotenv'
dotenv.config()

import * as Koa from 'koa'
import * as koaMount from 'koa-mount'
import * as koaStatic from 'koa-static'
import * as koaBodyParser from 'koa-bodyparser'
import * as koaCompress from 'koa-compress'

import { apiRouter } from './api'
import { authRouter } from './auth'
import { indexPageRouter } from './indexPage'
import config from './config'
import { redirectToHttps } from './utils'

const app = new Koa()
if (config.env === 'production') {
  app.proxy = true
  app.use(redirectToHttps)
}
app.use(koaCompress({ br: false }))
app.use(koaBodyParser())
app.use(koaStatic('dist/frontend/'))

if (config.auth) {
  app.use(koaMount('/auth', authRouter))
}
app.use(koaMount('/api', apiRouter))
app.use(indexPageRouter)

app.listen(config.port, config.bindHost, () => {
  console.log(`Listening on ${config.bindHost}:${config.port}`)
})
