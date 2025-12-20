exports.up = async function(knex) {
  // Check and create course_materials table
  const hasMaterialsTable = await knex.schema.hasTable('course_materials');
  if (!hasMaterialsTable) {
    await knex.schema.createTable('course_materials', function(table) {
      table.increments('id').primary();
      table.integer('course_id').unsigned().notNullable();
      table.string('title', 255).notNullable();
      table.text('description');
      table.string('file_type', 50); // pdf, doc, ppt, etc.
      table.string('file_path', 500).notNullable();
      table.integer('file_size'); // in bytes
      table.integer('uploaded_by').unsigned(); // faculty_id
      table.integer('download_count').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.foreign('uploaded_by').references('id').inTable('faculty');
    });
  }
  
  // Check and create assignments table
  const hasAssignmentsTable = await knex.schema.hasTable('assignments');
  if (!hasAssignmentsTable) {
    await knex.schema.createTable('assignments', function(table) {
      table.increments('id').primary();
      table.integer('course_id').unsigned().notNullable();
      table.string('title', 255).notNullable();
      table.text('description');
      table.text('instructions');
      table.datetime('due_date').notNullable();
      table.integer('max_marks').notNullable();
      table.string('attachment_path', 500);
      table.integer('created_by').unsigned(); // faculty_id
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.foreign('created_by').references('id').inTable('faculty');
    });
  }
  
  // Check and create assignment_submissions table
  const hasSubmissionsTable = await knex.schema.hasTable('assignment_submissions');
  if (!hasSubmissionsTable) {
    await knex.schema.createTable('assignment_submissions', function(table) {
      table.increments('id').primary();
      table.integer('assignment_id').unsigned().notNullable();
      table.integer('student_id').unsigned().notNullable();
      table.string('file_path', 500);
      table.text('comments');
      table.integer('marks_obtained');
      table.text('feedback');
      table.enum('status', ['submitted', 'graded']).defaultTo('submitted');
      table.timestamp('submitted_at').defaultTo(knex.fn.now());
      table.timestamp('graded_at');
      
      table.foreign('assignment_id').references('id').inTable('assignments').onDelete('CASCADE');
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
    });
  }
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('assignment_submissions')
    .dropTableIfExists('assignments')
    .dropTableIfExists('course_materials');
};
