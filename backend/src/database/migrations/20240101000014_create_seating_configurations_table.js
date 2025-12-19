exports.up = function(knex) {
  return knex.schema.createTable('seating_configurations', function(table) {
    table.increments('id').primary();
    table.string('config_name', 255).notNullable();
    table.enum('strategy', ['random', 'alphabetical', 'performance_based']).defaultTo('random');
    table.integer('min_distance_same_course').defaultTo(1);
    table.json('room_priority');
    table.decimal('capacity_threshold', 3, 2).defaultTo(0.90);
    table.integer('created_by').unsigned().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('created_by').references('id').inTable('users');
    table.index('config_name', 'idx_config_name');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('seating_configurations');
};
