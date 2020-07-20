import BaseModel from './BaseModel'
import { DAYS } from '../../helpers/times'

export default class File extends BaseModel {
  static get tableName(): string {
    return 'Files'
  }

  owner?: string
  cid?: string
  verified?: boolean
  sizeBytes?: number
  originalName?: string
  encoding?: string
  mimeType?: string
  expiresAt?: Date

  // sanitize owner address on find and insert
  static findOne(args: any) {
    if (args.owner) args.owner = args.owner.toLowerCase()
    return super.findOne(args)
  }
  $beforeInsert: BaseModel['$beforeInsert'] = async (queryContext) => {
    await super.$beforeInsert(queryContext)
    if (this.owner) this.owner = this.owner.toLowerCase()
    if (!this.expiresAt) this.expiresAt = new Date(Date.now() + 1 * DAYS) // expire in 1 day without verification
  }
  $beforeUpdate: BaseModel['$beforeUpdate'] = async (opt, queryContext) => {
    await super.$beforeUpdate(opt, queryContext)
    if (this.owner) this.owner = this.owner.toLowerCase()
  }

  static async findMeta(args: any) {
    const file = await this.findOne(args)
    return this.filterMeta(file)
  }

  static async findMetaPage(page = 0, pageSize = 10, args = {}) {
    const { total, results } = await File.query().orderBy('createdAt', 'DESC').page(page, pageSize).where(args)
    return {
      total,
      results: results.map(model => File.filterMeta(model))
    }
  }

  static filterMeta(File: File) {
    const { owner, cid, verified, sizeBytes, originalName, encoding, mimeType, createdAt } = File
    return {
      owner,
      cid,
      verified,
      sizeBytes,
      originalName,
      encoding,
      mimeType,
      createdAt
    }
  }
}
