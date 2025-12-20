exports.up = function(knex) {
  return knex.schema.table('hall_tickets', function(table) {
    // Add bulk_upload_id column to track which bulk upload created this hall ticket
    table.integer('bulk_upload_id').unsigned().nullable();
    table.foreign('bulk_upload_id').references('id').inTable('bulk_uploads').onDelete('SET NULL');
    table.index('bulk_upload_id', 'idx_hall_ticket_bulk_upload');
  });
};

exports.down = function(knex) {
  return knex.schema.table('hall_tickets', function(table) {
    table.dropForeign('bulk_upload_id');
    table.dropIndex('bulk_upload_id', 'idx_hall_ticket_bulk_upload');
    table.dropColumn('bulk_upload_id');
  });
};
