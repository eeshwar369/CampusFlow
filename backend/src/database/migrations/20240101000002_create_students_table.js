exports.up = function(knex) {
  return knex.schema.createTable('students', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('roll_number', 50).notNullable().unique();
    table.string('department', 100).notNullable();
    table.integer('year').notNullable();
    table.integer('semester').notNullable();
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index('roll_number', 'idx_roll_number');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('students');
};
