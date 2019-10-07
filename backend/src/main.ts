import * as dotenv from 'dotenv'
dotenv.config()

import * as Koa from 'koa'
import * as koaMount from 'koa-mount'
import * as koaStatic from 'koa-static'
import * as koaBodyParser from 'koa-bodyparser'
import * as koaCompress from 'koa-compress'
import basicAuth = require('koa-basic-auth')

import * as db from './db'
import api from './api'
import config from './config'

const app = new Koa()
if (config.basicAuth) {
  app.use(basicAuth(config.basicAuth))
}
app.use(koaCompress())
app.use(koaBodyParser())
app.use(koaStatic('static/'))
app.use(koaStatic('dist/frontend/'))

db.connect(config.databaseUrl).then(dbClient => {
  app.use(koaMount('/api', api(dbClient)))
})

app.listen(config.port, config.bindHost, () => {
  console.log(`Listening on ${config.bindHost}:${config.port}`)
})
