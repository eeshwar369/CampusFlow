exports.up = function(knex) {
  return knex.schema.createTable('student_performance', function(table) {
    table.increments('id').primary();
    table.integer('student_id').unsigned().notNullable();
    table.integer('course_id').unsigned().notNullable();
    table.integer('exam_id').unsigned();
    table.decimal('marks_obtained', 5, 2);
    table.decimal('total_marks', 5, 2);
    table.decimal('percentage', 5, 2);
    table.string('grade', 5);
    table.timestamp('recorded_at').defaultTo(knex.fn.now());
    
    table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
    table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.foreign('exam_id').references('id').inTable('exams').onDelete('SET NULL');
    table.index(['student_id', 'course_id'], 'idx_student_course');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('student_performance');
};
