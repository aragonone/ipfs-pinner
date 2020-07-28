import { Context } from 'koa'
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes'
import { isAddress } from 'web3-utils'

import { FileMeta } from '@aragonone/ipfs-background-service-shared'

interface error {
  [type: string]: string
}

interface publicValidateFunction {
  (ctx: Context): Promise<void>
}


export default class FilesValidator {
  static validateForCreate: publicValidateFunction = async (ctx) => {
    const errors: error[] = []
    const { body: { owner }, file } = ctx.request
    if (!owner) {
      errors.push({ owner: 'Owner address must be given' })
    }
    else if (!isAddress(owner)) {
      errors.push({ owner: 'Given address is not valid' })
    }
    if (!file) {
      errors.push({ file: 'File content must be given' })
    }
    if (errors.length) ctx.throw(BAD_REQUEST, {errors})
  }

  // delete endpoint to do later
  // static validateForDelete: publicValidateFunction = (ctx) => {
  //   FilesValidator.validateFileExists(ctx)
  //   const errors: error[] = []
  //   const { signature } = ctx.request.body
  //   if (!signature) {
  //     errors.push({ signature: 'File owner signature must be given' })
  //   }
  //   // todo: { signature: 'Given signature is not valid' }
  //   if (errors.length) ctx.throw(BAD_REQUEST, {errors})
  // }

  static validateForFindOne: publicValidateFunction = async (ctx) => {
    await FilesValidator.validateFileExists(ctx)
  }

  static validateForFindAll: publicValidateFunction = async (ctx) => {
    const errors: error[] = []
    const { owner, page, pageSize } = ctx.params
    if (typeof owner !== 'undefined' && !isAddress(owner)) {
      errors.push({ owner: 'Given address is not valid' })
    }
    if (typeof page !== 'undefined' && (typeof page != 'number' || page < 0)) {
      errors.push({ page: 'Given page is not valid' })
    }
    if (typeof pageSize !== 'undefined' && (typeof pageSize != 'number' || pageSize < 1)) {
      errors.push({ pageSize: 'Given pageSize is not valid' })
    }
  }

  static validateFileExists: publicValidateFunction = async (ctx) => {
    const { cid } = ctx.params
    if (!await FileMeta.exists({cid})) {
      ctx.throw(NOT_FOUND, { errors: [ { file: 'Not found' } ] })
    }
  }
}
