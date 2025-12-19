exports.up = function(knex) {
  return knex.schema.createTable('study_recommendations', function(table) {
    table.increments('id').primary();
    table.integer('student_id').unsigned().notNullable();
    table.integer('course_id').unsigned().notNullable();
    table.string('topic', 255).notNullable();
    table.enum('priority', ['high', 'medium', 'low']).notNullable();
    table.text('reason');
    table.timestamp('generated_at').defaultTo(knex.fn.now());
    
    table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
    table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.index(['student_id', 'priority'], 'idx_student_priority');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('study_recommendations');
};
