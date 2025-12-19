exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    // Add roles JSON column to support multiple roles
    table.json('roles').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('roles');
  });
};
