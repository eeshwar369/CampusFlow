exports.up = function(knex) {
  return knex.schema.createTable('event_documents', function(table) {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable();
    table.string('file_path', 500).notNullable();
    table.string('file_name', 255).notNullable();
    table.integer('file_size').notNullable();
    table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    
    table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE');
    table.index('event_id', 'idx_event');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('event_documents');
};
