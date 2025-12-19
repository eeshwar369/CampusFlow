exports.up = function(knex) {
  return knex.schema.createTable('calendar_entries', function(table) {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description');
    table.enum('entry_type', ['exam', 'deadline', 'event', 'holiday']).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date');
    table.time('start_time');
    table.time('end_time');
    table.string('location', 255);
    table.integer('created_by').unsigned().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('created_by').references('id').inTable('users');
    table.index(['start_date', 'end_date'], 'idx_date_range');
    table.index('entry_type', 'idx_type');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('calendar_entries');
};
