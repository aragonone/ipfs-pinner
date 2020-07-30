import Knex from 'knex'
import { Model, MaybeCompositeId, AnyQueryBuilder } from 'objection'

import config from '../../database/config'
Model.knex(Knex(config))

export default class BaseModel extends Model {
  // modelPaths is used to allow modelClass relations be defined as a string to avoid require loops
  // https://vincit.github.io/objection.js/guide/relations.html#require-loops
  static get modelPaths(): [string] {
    return [__dirname];
  }

  id!: MaybeCompositeId
  updatedAt?: Date
  createdAt?: Date

  $beforeUpdate: Model['$beforeUpdate'] = async (opt, queryContext) => {
    await super.$beforeUpdate(opt, queryContext)
    this.updatedAt = new Date()
  }


  // static query methods (table level)

  static findOne(args: any): AnyQueryBuilder {
    return this.query().findOne(args)
  }

  static findById(id: BaseModel['id']): AnyQueryBuilder {
    return this.query().findById(id)
  }

  static update(args: any): AnyQueryBuilder {
    return this.query().update(args)
  }

  static create (args: any): AnyQueryBuilder {
    return this.query().insert(args)
  }

  static async findOrCreate(args: any): Promise<AnyQueryBuilder> {
    let row = await this.findOne(args)
    if (!row) row = await this.create(args)
    return row
  }

  static async exists(args: any): Promise<boolean> {
    return !!(await this.findOne(args))
  }

  static count(args: any): Promise<number> {
    return this.query().where(args).resultSize()
  }

  static del(args: any): AnyQueryBuilder {
    return this.query().where(args).del()
  }
  

  // instance query methods (row level)

  del(): AnyQueryBuilder {
    return this.$query().del()
  }
  
}
