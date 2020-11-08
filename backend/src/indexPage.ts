import { Route, Response, route, router } from 'typera-koa'
import { validateAuth } from './auth'

const indexPage: Route<
  Response.Ok<string, { 'Content-Type': string }>
> = route.get('/').handler(async req => {
  const isLoggedIn = validateAuth(req.ctx as any)

  return Response.ok(
    `\
<!DOCTYPE html>

<head>
  <title>FIFA log</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="index.css">
</head>

<body>
  <div id="app"></div>
  <script>var IS_LOGGED_IN = ${isLoggedIn};</script>
  <script src="index.js"></script>
</body>
`,
    { 'Content-Type': 'text/html' }
  )
})

export const indexPageRouter = router(indexPage).handler()
