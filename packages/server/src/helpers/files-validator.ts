import { Context } from 'koa'
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes'
import { utils } from 'ethers'

import { FileMeta, times } from '@aragonone/ipfs-background-service-shared'

const SIGNATURE_TIMESTAMP_EXPIRATION = times.MINUTES * 10
interface error {
  [type: string]: string
}

export default class FilesValidator {
  static validateForCreate(ctx: Context) {
    const errors: error[] = []
    const { body: { owner }, file } = ctx.request
    if (!owner) {
      errors.push({ owner: 'Owner address must be given' })
    }
    else if (!utils.isAddress(owner)) {
      errors.push({ owner: 'Given owner address is not valid' })
    }
    if (!file) {
      errors.push({ file: 'File content must be given' })
    }
    if (errors.length) ctx.throw(BAD_REQUEST, {errors})
  }

  static async validateForDelete(ctx: Context) {
    await this.validateFileExists(ctx)
    const errors: error[] = []
    this.validateTimestampFormat(ctx, errors)
    this.validateSignatureFormat(ctx, errors)
    if (!errors.length) {
      await this.validateSignatureAddress(ctx, errors)
    }
    if (errors.length) ctx.throw(BAD_REQUEST, {errors})
  }

  static async validateForFindOne(ctx: Context) {
    await this.validateFileExists(ctx)
  }

  static validateForFindAll(ctx: Context) {
    const errors: error[] = []
    const { owner, page, pageSize } = ctx.params
    if (typeof owner !== 'undefined' && !utils.isAddress(owner)) {
      errors.push({ owner: 'Given owner address is not valid' })
    }
    if (typeof page !== 'undefined' && (typeof page != 'number' || page < 0)) {
      errors.push({ page: 'Given page is not valid' })
    }
    if (typeof pageSize !== 'undefined' && (typeof pageSize != 'number' || pageSize < 1)) {
      errors.push({ pageSize: 'Given pageSize is not valid' })
    }
    if (errors.length) ctx.throw(BAD_REQUEST, {errors})
  }

  static async validateFileExists(ctx: Context) {
    const { cid } = ctx.params
    if (!await FileMeta.exists({cid})) {
      ctx.throw(NOT_FOUND, { errors: [ { file: 'Not found' } ] })
    }
  }

  private static validateTimestampFormat(ctx: Context, errors: error[]) {
    const { timestamp } = ctx.request.body
    if (!timestamp) {
      errors.push({timestamp: 'A timestamp must be given'})
    }
    else if (Number(timestamp) > Date.now()) {
      errors.push({timestamp: 'Given timestamp is not valid'})
    }
    else if (Number(timestamp) < Date.now() - SIGNATURE_TIMESTAMP_EXPIRATION) {
      errors.push({timestamp: 'Given timestamp is obsolete'})
    }
  }

  private static validateSignatureFormat(ctx: Context, errors: error[]) {
    const { signature } = ctx.request.body
    if (!signature) {
      errors.push({signature: 'A signature must be given'})
    }
    else {
      try {
        utils.splitSignature(signature)
      } catch {
        errors.push({ signature: 'Given signature is not valid' })
      }
    }
  }

  private static async validateSignatureAddress(ctx: Context, errors: error[]) {
    const { signature, timestamp } = ctx.request.body
    const { cid } = ctx.params
    const { owner } = await FileMeta.findOne({cid})
    const signedAddress = utils.verifyMessage(String(timestamp), signature)
    if (owner.toLowerCase() !== signedAddress.toLowerCase()) {
      errors.push({ signature: 'Signature address and owner address do not match' })
    }
  }
}
