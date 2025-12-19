exports.up = function(knex) {
  return knex.schema
    .table('seating_allocations', function(table) {
      table.integer('seat_position').unsigned().after('seat_number');
      table.integer('allocated_by').unsigned().alter();
    })
    .table('seating_configurations', function(table) {
      table.integer('exam_id').unsigned().after('id');
      table.integer('spacing').defaultTo(1).after('strategy');
      table.boolean('exclude_detained').defaultTo(true).after('spacing');
      table.boolean('randomize').defaultTo(false).after('exclude_detained');
      table.json('config_data').after('randomize');
      
      table.foreign('exam_id').references('id').inTable('exams').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema
    .table('seating_allocations', function(table) {
      table.dropColumn('seat_position');
    })
    .table('seating_configurations', function(table) {
      table.dropForeign('exam_id');
      table.dropColumn('exam_id');
      table.dropColumn('spacing');
      table.dropColumn('exclude_detained');
      table.dropColumn('randomize');
      table.dropColumn('config_data');
    });
};
