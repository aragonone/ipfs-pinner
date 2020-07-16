import Router from '@koa/router'
import multer from '@koa/multer'
import { DefaultState, DefaultContext } from 'koa'

import FilesController from '../controllers/files'

const MEGABYTES = 10 ** 6
const upload = multer({
  limits: {
    fileSize: 10 * MEGABYTES
  },
  dest: '/uploads'
})

const router = new Router<DefaultState, DefaultContext>()

router.get('/', (ctx) => ctx.body = { up: true })
router.post('/files', upload.single('file'), FilesController.create)
// delete endpoint to do later
//router.post('/files/:cid\\:delete', FilesController.delete)
router.get('/files', FilesController.findAll)
router.get('/files/:cid', FilesController.findOne)

export default router.routes()
