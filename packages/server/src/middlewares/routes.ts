import Router from '@koa/router'
import { DefaultState, DefaultContext } from 'koa'

import FilesController from '../controllers/files'

const router = new Router<DefaultState, DefaultContext>()

router.get('/', (ctx) => ctx.body = { up: true })
router.post('/files', FilesController.upload, FilesController.create)
router.post('/files/:cid\\:delete', FilesController.delete)
router.get('/files', FilesController.findAll)
router.get('/files/:cid', FilesController.findOne)

export default router.routes()
