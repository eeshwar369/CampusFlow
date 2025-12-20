exports.up = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('courses', 'faculty_id');
  
  if (!hasColumn) {
    await knex.schema.table('courses', function(table) {
      table.integer('faculty_id').unsigned().nullable();
      table.foreign('faculty_id').references('id').inTable('faculty').onDelete('SET NULL');
    });
  }
};

exports.down = function(knex) {
  return knex.schema.table('courses', function(table) {
    table.dropForeign('faculty_id');
    table.dropColumn('faculty_id');
  });
};
