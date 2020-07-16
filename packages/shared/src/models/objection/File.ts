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
  transactionHash?: string
  expiresAt?: Date

  // sanitize owner address on find and insert
  static findOne(args: any) {
    if (args.owner) args.owner = args.owner.toLowerCase()
    return super.findOne(args)
  }
  $beforeInsert: BaseModel['$beforeInsert'] = async (queryContext) => {
    await super.$beforeInsert(queryContext)
    if (this.owner) this.owner = this.owner.toLowerCase()
    if (!this.expiresAt) this.expiresAt = new Date(Date.now() + 1 * DAYS)
  }
  $beforeUpdate: BaseModel['$beforeUpdate'] = async (opt, queryContext) => {
    await super.$beforeUpdate(opt, queryContext)
    if (this.owner) this.owner = this.owner.toLowerCase()
  }
}
