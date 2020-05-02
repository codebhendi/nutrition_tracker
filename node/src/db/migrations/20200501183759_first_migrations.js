
exports.up = (knex) => (
  knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').unique().notNullable();
      table.string('password').notNullable();
      table.bool('admin').defaultTo(false);
      table.bool('is_activated').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.raw('now()'));
    })
    .createTable('calorie_count', (table) => {
      table.increments('id').primary();
      table.text('description').notNullable();
      table.float('calories').notNullable();
      table.integer('created_by').references('users.id').notNullable();
      table.timestamp('created_at').defaultTo(knex.raw('now()'));
    })
);

exports.down = (knex) => (
  knex.schema
    .dropTable('calorie_count')
    .dropTable('users')
);
