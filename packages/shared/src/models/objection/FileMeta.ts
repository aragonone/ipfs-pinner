import BaseModel from './BaseModel'
import { HOURS } from '../../helpers/times'
import etherscan from '../etherscan'

const EXPIRATION_PERIOD = 24 * HOURS

export default class FileMeta extends BaseModel {
  static get tableName(): string {
    return 'Files'
  }

  owner?: string
  cid?: string
  verified?: boolean
  sizeBytes?: number
  originalName?: string | null
  encoding?: string | null
  mimeType?: string | null
  expiresAt?: Date | null
  transactionHash?: string | null
  lastScannedBlock?: number

  static findOne(args: any) {
    if (args.owner) args.owner = args.owner.toLowerCase() // sanitize address
    return super.findOne(args)
  }
  $beforeInsert: BaseModel['$beforeInsert'] = async (queryContext) => {
    await super.$beforeInsert(queryContext)
    if (this.owner) this.owner = this.owner.toLowerCase() // sanitize address
    // expire in 1 day without verification
    if (!this.expiresAt) this.expiresAt = new Date(Date.now() + EXPIRATION_PERIOD)
    // set lastScannedBlock as current block
    if (!this.lastScannedBlock) this.lastScannedBlock = await etherscan.getBlockNumber()
  }
  $beforeUpdate: BaseModel['$beforeUpdate'] = async (opt, queryContext) => {
    await super.$beforeUpdate(opt, queryContext)
    if (this.owner) this.owner = this.owner.toLowerCase() // sanitize address
  }

  static async findMeta(args: any) {
    const file = await this.findOne(args)
    return this.filterMeta(file)
  }

  static async findMetaPage(page = 0, pageSize = 10, args = {}) {
    const { total, results } = await this.query().orderBy('createdAt', 'DESC').page(page, pageSize).where(args)
    return {
      total,
      results: results.map(model => this.filterMeta(model))
    }
  }

  static filterMeta(File: FileMeta) {
    const { owner, cid, verified, sizeBytes, originalName, encoding, mimeType, transactionHash, createdAt } = File
    return {
      owner,
      cid,
      verified,
      sizeBytes,
      originalName,
      encoding,
      mimeType,
      transactionHash,
      createdAt
    }
  }

  static findUnverified() {
    return this.query().where({verified: false})
  }

  isExpired(): boolean {
    return this.expiresAt != null && this.expiresAt < new Date(Date.now())
  }
}
