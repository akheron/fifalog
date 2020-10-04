import * as koa from 'koa'

export async function redirectToHttps(
  ctx: koa.Context,
  next: () => Promise<any>
) {
  if (ctx.protocol !== 'https') {
    ctx.status = 301
    ctx.redirect(`https://${ctx.host}${ctx.url}`)
  } else {
    await next()
  }
}
