exports.up = function(knex) {
  return knex.schema.createTable('rooms', function(table) {
    table.increments('id').primary();
    table.string('room_name', 100).notNullable().unique();
    table.string('building', 100).notNullable();
    table.integer('floor').notNullable();
    table.integer('capacity').notNullable();
    table.boolean('is_available').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('room_name', 'idx_room_name');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('rooms');
};
