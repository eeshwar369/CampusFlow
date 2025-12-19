exports.up = function(knex) {
  return knex.schema.createTable('syllabus', function(table) {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable();
    table.string('file_path', 500).notNullable();
    table.string('file_name', 255).notNullable();
    table.integer('file_size').notNullable();
    table.integer('uploaded_by').unsigned().notNullable();
    table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    table.boolean('mindmap_generated').defaultTo(false);
    table.text('mindmap_json', 'longtext');
    
    table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.foreign('uploaded_by').references('id').inTable('users');
    table.index('course_id', 'idx_course');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('syllabus');
};
