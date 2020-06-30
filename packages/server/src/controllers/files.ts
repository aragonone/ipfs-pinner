import { Middleware } from 'koa'
import { ObjectionModels } from '@aragonone/ipfs-background-service-shared'
const { File } = ObjectionModels

export const create: Middleware = async (ctx, next) => {
  await File.create('test')
  ctx.body = {
    ... ctx.request.body
  }
  await next()
}
