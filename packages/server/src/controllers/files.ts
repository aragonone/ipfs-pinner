import { Middleware } from 'koa'
import multer from '@koa/multer'
import fs from 'fs'
import { promisify } from 'util'
import { BAD_REQUEST } from 'http-status-codes'

import { FileMeta, ipfs } from '@aragonone/ipfs-pinner-shared'
import FilesValidator from '../helpers/files-validator'

const MEGABYTES = 10 ** 6
const upload = multer({
  limits: {
    fileSize: 10 * MEGABYTES
  },
  dest: '/uploads'
})
const deleteTempFile = promisify(fs.unlink)

export default class FilesController {
  static upload: Middleware = upload.single('file')

  static create: Middleware = async (ctx) => {
    const { body: { owner }, file } = ctx.request
    let cid = ''
    try {
      FilesValidator.validateForCreate(ctx)
      cid = await ipfs.add(file.path)
      if (await FileMeta.exists({cid})) {
        ctx.throw(BAD_REQUEST, { errors: [ { file: `File is already uploaded with cid ${cid}`} ] })
      }
      await FileMeta.create({
        owner,
        cid,
        sizeBytes: file.size,
        originalName: file.originalname,
        encoding: file.encoding,
        mimeType: file.mimetype
      })
    }
    catch (err) {
      await deleteTempFile(file.path)
      throw err
    }
    await deleteTempFile(file.path)
    ctx.body = await FileMeta.findMeta({cid})
  }

  static delete: Middleware = async (ctx) => {
    await FilesValidator.validateForDelete(ctx)
    const { cid } = ctx.params
    await FileMeta.del({cid})
    await ipfs.del(cid)
    ctx.body = {
      deleted: true
    }
  }

  static findAll: Middleware = async (ctx) => {
    FilesValidator.validateForFindAll(ctx)
    const { owner, page = 0, pageSize = 10 } = ctx.params
    let args = {}
    if (owner) args = {owner}
    ctx.body = await FileMeta.findMetaPage(page, pageSize, args)
  }

  static findOne: Middleware = async (ctx) => {
    await FilesValidator.validateForFindOne(ctx)
    const { cid } = ctx.params
    ctx.body = await FileMeta.findMeta({cid})
  }
}
