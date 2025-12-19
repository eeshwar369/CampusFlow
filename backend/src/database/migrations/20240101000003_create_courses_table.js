exports.up = function(knex) {
  return knex.schema.createTable('courses', function(table) {
    table.increments('id').primary();
    table.string('code', 20).notNullable().unique();
    table.string('name', 255).notNullable();
    table.string('department', 100).notNullable();
    table.integer('credits').notNullable();
    table.integer('semester').notNullable();
    table.integer('year').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('code', 'idx_code');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('courses');
};
