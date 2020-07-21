import * as Knex from 'knex'


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('Files', function (table) {
    table.increments('id')
    table.string('owner').index().notNullable()
    table.string('cid').unique().notNullable()
    table.boolean('verified').index().defaultTo(false).notNullable()
    table.integer('sizeBytes').unsigned().notNullable()
    table.string('originalName')
    table.string('encoding')
    table.string('mimeType')
    table.dateTime('expiresAt').index()
    table.dateTime('createdAt').defaultTo(knex.fn.now()).notNullable()
    table.dateTime('updatedAt').defaultTo(knex.fn.now()).notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('Files')
}
