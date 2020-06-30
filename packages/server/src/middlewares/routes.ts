import Router from '@koa/router'

import { files } from '../controllers'

const router = new Router()
router.post('/files', files.create)

export default router.routes()
