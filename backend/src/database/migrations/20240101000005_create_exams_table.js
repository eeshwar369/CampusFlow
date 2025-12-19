exports.up = function(knex) {
  return knex.schema.createTable('exams', function(table) {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable();
    table.string('exam_name', 255).notNullable();
    table.date('exam_date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.integer('duration_minutes').notNullable();
    table.integer('total_marks').notNullable();
    table.boolean('seating_allocated').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.index('exam_date', 'idx_exam_date');
    table.index('course_id', 'idx_course');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('exams');
};
