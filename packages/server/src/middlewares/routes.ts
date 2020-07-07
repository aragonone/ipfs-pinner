import Router from '@koa/router'

import { FilesController } from '../controllers'

const router = new Router()
router.get('/', (ctx) => ctx.body = { up: true })
router.post('/files', FilesController.create)
router.post('/files/:cid\\:unpin', FilesController.unpin)
router.get('/files', FilesController.getAll)
router.get('/files/:cid', FilesController.getSingle)

export default router.routes()
