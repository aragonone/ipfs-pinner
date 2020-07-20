import { Middleware } from 'koa'
import multer from '@koa/multer'
import ipfsClient, { globSource } from 'ipfs-http-client'
import fs from 'fs'
import { promisify } from 'util'

import { ObjectionModels } from '@aragonone/ipfs-background-service-shared'
import { FilesValidator } from '../helpers'

const MEGABYTES = 10 ** 6
const upload = multer({
  limits: {
    fileSize: 10 * MEGABYTES
  },
  dest: '/uploads'
})
const { File } = ObjectionModels
const ipfs = ipfsClient(process.env.IPFS_API_URL)
const deleteTempFile = promisify(fs.unlink)

const dummy_file = {
  sizeBytes: 5712538,
  extension: "pdf",    
  encoding: "UTF-8",
  createdAt: 1590322097,
  owner: "0x...",
  verified: false,
  transactionHash: "0x...",
  cid: "Qm..."
}

export default class FilesController {
  static upload: Middleware = upload.single('file')

  static create: Middleware = async (ctx) => {
    const { body: { owner }, file } = ctx.request
    try {
      FilesValidator.validateForCreate(ctx)
      const ipfsFile = await ipfs.add(globSource(file.path))
      dummy_file.cid = ipfsFile.cid.toString()
      await File.create('test')
    }
    catch (err) {
      await deleteTempFile(file.path)
      throw err
    }
    await deleteTempFile(file.path)
    ctx.body = dummy_file
  }

  static delete: Middleware = async (ctx) => {
    FilesValidator.validateForDelete(ctx)
    ctx.body = {
      deleted: true
    }
  }

  static findAll: Middleware = async (ctx) => {
    ctx.body = {
      total: 100,
      results: [dummy_file]
    }
  }

  static findOne: Middleware = async (ctx) => {
    FilesValidator.validateForGetSingle(ctx)
    ctx.body = dummy_file
  }
}
