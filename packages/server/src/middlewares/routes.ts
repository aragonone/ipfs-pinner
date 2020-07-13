import Router from '@koa/router'

import { FilesController } from '../controllers'

const router = new Router()
router.get('/', (ctx) => ctx.body = { up: true })
router.post('/files', FilesController.create)
router.post('/files/:cid\\:delete', FilesController.delete)
router.get('/files', FilesController.findAll)
router.get('/files/:cid', FilesController.findOne)

export default router.routes()
