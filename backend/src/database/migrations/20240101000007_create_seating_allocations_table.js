exports.up = function(knex) {
  return knex.schema.createTable('seating_allocations', function(table) {
    table.increments('id').primary();
    table.integer('exam_id').unsigned().notNullable();
    table.integer('student_id').unsigned().notNullable();
    table.integer('room_id').unsigned().notNullable();
    table.string('seat_number', 20).notNullable();
    table.timestamp('allocated_at').defaultTo(knex.fn.now());
    table.integer('allocated_by').unsigned().notNullable();
    
    table.foreign('exam_id').references('id').inTable('exams').onDelete('CASCADE');
    table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
    table.foreign('room_id').references('id').inTable('rooms').onDelete('CASCADE');
    table.foreign('allocated_by').references('id').inTable('users');
    table.unique(['exam_id', 'room_id', 'seat_number'], 'unique_seat');
    table.index(['exam_id', 'student_id'], 'idx_exam_student');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('seating_allocations');
};
