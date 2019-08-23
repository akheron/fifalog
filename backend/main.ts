import * as dotenv from 'dotenv'
dotenv.config()

import * as Koa from 'koa'
import * as koaStatic from 'koa-static'
import * as koaBodyParser from 'koa-bodyparser'
import basicAuth = require('koa-basic-auth')

import * as db from './db'
import api from './api'
import config from './config'

const app = new Koa()
if (config.basicAuth) {
  app.use(basicAuth(config.basicAuth))
}
app.use(koaBodyParser())
app.use(koaStatic('static/'))
app.use(koaStatic('dist/frontend/'))

db.connect(config.databaseUrl).then(dbClient => {
  app.use(api(dbClient).routes())
})

app.listen(config.port, config.bindHost, () => {
  console.log(`Listening on ${config.bindHost}:${config.port}`)
})
