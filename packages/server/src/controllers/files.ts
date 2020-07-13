import { Middleware } from 'koa'

import { ObjectionModels } from '@aragonone/ipfs-background-service-shared'
const { File } = ObjectionModels
import { FilesValidator } from '../helpers'

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
  static create: Middleware = async (ctx) => {
    FilesValidator.validateForCreate(ctx)
    await File.create('test')
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
