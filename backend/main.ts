import * as dotenv from 'dotenv'
dotenv.config()

import * as Koa from 'koa'
import * as koaStatic from 'koa-static'
import basicAuth = require('koa-basic-auth')

import config from './config'

const app = new Koa()
if (config.basicAuth) {
  app.use(basicAuth(config.basicAuth))
}
app.use(koaStatic('static/'))
app.use(koaStatic('dist/frontend/'))

app.listen(config.port, config.bindHost, () => {
  console.log(`Listening on ${config.bindHost}:${config.port}`)
})
