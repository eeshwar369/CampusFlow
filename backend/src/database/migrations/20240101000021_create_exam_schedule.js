exports.up = function(knex) {
  return knex.schema
    // Update exams table
    .table('exams', function(table) {
      table.string('exam_type', 50).defaultTo('regular'); // regular, mid-term, end-term, supplementary
      table.date('start_date');
      table.date('end_date');
      table.enum('status', ['draft', 'published', 'ongoing', 'completed', 'cancelled']).defaultTo('draft');
      table.integer('created_by').unsigned();
      table.integer('published_by').unsigned();
      table.timestamp('published_at').nullable();
      
      table.foreign('created_by').references('id').inTable('users');
      table.foreign('published_by').references('id').inTable('users');
    })
    // Create exam_schedule table for multiple subjects per exam
    .createTable('exam_schedule', function(table) {
      table.increments('id').primary();
      table.integer('exam_id').unsigned().notNullable();
      table.integer('course_id').unsigned().notNullable();
      table.date('exam_date').notNullable();
      table.time('start_time').notNullable();
      table.time('end_time').notNullable();
      table.integer('duration_minutes').notNullable();
      table.integer('total_marks').defaultTo(100);
      table.text('instructions');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('exam_id').references('id').inTable('exams').onDelete('CASCADE');
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.index(['exam_id', 'exam_date'], 'idx_exam_schedule');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('exam_schedule')
    .raw(`
      ALTER TABLE exams 
      DROP COLUMN IF EXISTS exam_type,
      DROP COLUMN IF EXISTS start_date,
      DROP COLUMN IF EXISTS end_date,
      DROP COLUMN IF EXISTS status,
      DROP COLUMN IF EXISTS created_by,
      DROP COLUMN IF EXISTS published_by,
      DROP COLUMN IF EXISTS published_at
    `);
};
