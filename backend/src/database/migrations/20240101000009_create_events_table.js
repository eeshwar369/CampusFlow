exports.up = function(knex) {
  return knex.schema.createTable('events', function(table) {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description').notNullable();
    table.date('event_date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.string('location', 255).notNullable();
    table.integer('expected_attendance').notNullable();
    table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
    table.integer('submitted_by').unsigned().notNullable();
    table.integer('reviewed_by').unsigned();
    table.text('rejection_reason');
    table.timestamp('submitted_at').defaultTo(knex.fn.now());
    table.timestamp('reviewed_at').nullable();
    
    table.foreign('submitted_by').references('id').inTable('users');
    table.foreign('reviewed_by').references('id').inTable('users');
    table.index('status', 'idx_status');
    table.index('submitted_by', 'idx_submitted_by');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('events');
};
