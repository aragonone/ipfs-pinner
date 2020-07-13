import { Context } from 'koa'
import { BAD_REQUEST } from 'http-status-codes'
import { utils } from 'ethers'

interface error {
  [type: string]: string
}

interface publicValidateFunction {
  (ctx: Context): void
}


export default class FilesValidator {
  static validateForCreate: publicValidateFunction = (ctx) => {
    const errors: error[] = []
    const { owner, file } = ctx.request.body
    if (!owner) {
      errors.push({ owner: 'Owner address must be given' })
    }
    else if (!utils.isAddress(owner)) {
      errors.push({ owner: 'Given address is not valid' })
    }
    if (!file) {
      errors.push({ file: 'File content must be given' })
    }
    // todo: { file: 'File is already uploaded' }
    if (errors.length) ctx.throw(BAD_REQUEST, {errors})
  }

  static validateForDelete: publicValidateFunction = (ctx) => {
    FilesValidator.validateFileExists(ctx)
    const errors: error[] = []
    const { signature } = ctx.request.body
    if (!signature) {
      errors.push({ signature: 'File owner signature must be given' })
    }
    // todo: { signature: 'Given signature is not valid' }
    if (errors.length) ctx.throw(BAD_REQUEST, {errors})
  }

  static validateForGetSingle: publicValidateFunction = (ctx) => {
    FilesValidator.validateFileExists(ctx)
  }

  static validateFileExists: publicValidateFunction = (ctx) => {
    ctx // todo: ctx.throw(NOT_FOUND, { errors: [ { file: 'Not found' } ] })
  }
}
