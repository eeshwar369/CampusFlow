exports.up = function(knex) {
  return knex.schema.createTable('event_participations', function(table) {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable();
    table.integer('student_id').unsigned().notNullable();
    table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
    table.integer('approved_by').unsigned();
    table.timestamp('requested_at').defaultTo(knex.fn.now());
    table.timestamp('approved_at').nullable();
    table.text('rejection_reason');
    
    table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE');
    table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
    table.foreign('approved_by').references('id').inTable('users');
    
    table.unique(['event_id', 'student_id']);
    table.index('status', 'idx_participation_status');
    table.index('event_id', 'idx_participation_event');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('event_participations');
};
