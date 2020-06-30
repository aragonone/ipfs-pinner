import cors from '@koa/cors'

export default cors({
  credentials: true,
  origin: function (ctx) {
    const { origin } = ctx.request
    const whitelist = process.env.CORS_WHITELIST?.split(',') || ['']
    if (whitelist.indexOf(origin) !== -1 || whitelist[0] == '*') {
      return origin
    } else {
      return ''
    }
  }
})
