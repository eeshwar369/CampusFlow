exports.up = function(knex) {
  return knex.schema.createTable('audit_logs', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned();
    table.string('action', 100).notNullable();
    table.string('table_name', 100);
    table.integer('record_id');
    table.text('old_value', 'longtext');
    table.text('new_value', 'longtext');
    table.string('ip_address', 45);
    table.text('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.index(['user_id', 'action'], 'idx_user_action');
    table.index('created_at', 'idx_created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('audit_logs');
};
