exports.up = function(knex) {
  return knex.schema
    // Hall tickets table (enhanced)
    .createTable('hall_tickets', function(table) {
      table.increments('id').primary();
      table.integer('student_id').unsigned().notNullable();
      table.integer('exam_id').unsigned().notNullable();
      table.string('ticket_number', 50).notNullable().unique();
      table.string('qr_code', 500);
      table.string('barcode', 500);
      table.string('file_path', 500);
      table.enum('status', ['pending', 'approved', 'rejected', 'delivered']).defaultTo('pending');
      table.integer('approved_by').unsigned();
      table.timestamp('approved_at').nullable();
      table.timestamp('generated_at').defaultTo(knex.fn.now());
      
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
      table.foreign('exam_id').references('id').inTable('exams').onDelete('CASCADE');
      table.foreign('approved_by').references('id').inTable('users');
      table.index(['student_id', 'exam_id'], 'idx_hall_ticket_student_exam');
    })
    // Bulk upload tracking
    .createTable('bulk_uploads', function(table) {
      table.increments('id').primary();
      table.enum('upload_type', ['hall_tickets', 'students', 'results', 'attendance']).notNullable();
      table.string('file_name', 255).notNullable();
      table.string('file_path', 500).notNullable();
      table.integer('total_records').notNullable();
      table.integer('success_count').defaultTo(0);
      table.integer('failure_count').defaultTo(0);
      table.json('error_details');
      table.enum('status', ['processing', 'completed', 'failed']).defaultTo('processing');
      table.integer('uploaded_by').unsigned().notNullable();
      table.timestamp('uploaded_at').defaultTo(knex.fn.now());
      
      table.foreign('uploaded_by').references('id').inTable('users');
      table.index('status', 'idx_upload_status');
    })
    // Student academic status
    .createTable('student_academic_status', function(table) {
      table.increments('id').primary();
      table.integer('student_id').unsigned().notNullable();
      table.integer('year').notNullable();
      table.integer('semester').notNullable();
      table.integer('credits_earned').defaultTo(0);
      table.integer('credits_required').notNullable();
      table.decimal('cgpa', 3, 2);
      table.enum('status', ['active', 'detained', 'promoted', 'graduated', 'dropped']).defaultTo('active');
      table.text('remarks');
      table.timestamp('status_updated_at').defaultTo(knex.fn.now());
      
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
      table.index(['student_id', 'year', 'semester'], 'idx_student_academic');
    })
    // Mind map data
    .createTable('mind_maps', function(table) {
      table.increments('id').primary();
      table.integer('syllabus_id').unsigned().notNullable();
      table.integer('student_id').unsigned();
      table.json('map_data').notNullable();
      table.json('topics');
      table.json('resources');
      table.enum('status', ['generating', 'completed', 'failed']).defaultTo('generating');
      table.timestamp('generated_at').defaultTo(knex.fn.now());
      
      table.foreign('syllabus_id').references('id').inTable('syllabus').onDelete('CASCADE');
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
      table.index('syllabus_id', 'idx_mindmap_syllabus');
    })
    // Event participants
    .createTable('event_participants', function(table) {
      table.increments('id').primary();
      table.integer('event_id').unsigned().notNullable();
      table.integer('student_id').unsigned().notNullable();
      table.enum('status', ['registered', 'confirmed', 'cancelled']).defaultTo('registered');
      table.boolean('notified').defaultTo(false);
      table.timestamp('registered_at').defaultTo(knex.fn.now());
      
      table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE');
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
      table.unique(['event_id', 'student_id'], 'unique_participant');
    })
    // Event change log
    .createTable('event_change_log', function(table) {
      table.increments('id').primary();
      table.integer('event_id').unsigned().notNullable();
      table.integer('changed_by').unsigned().notNullable();
      table.string('change_type', 50).notNullable(); // reschedule, cancel, update
      table.json('old_data');
      table.json('new_data');
      table.text('reason');
      table.timestamp('changed_at').defaultTo(knex.fn.now());
      
      table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE');
      table.foreign('changed_by').references('id').inTable('users');
      table.index('event_id', 'idx_event_changes');
    })
    // Seating blueprints
    .createTable('seating_blueprints', function(table) {
      table.increments('id').primary();
      table.integer('room_id').unsigned().notNullable();
      table.string('blueprint_name', 255).notNullable();
      table.json('layout_data').notNullable(); // seat positions, rows, columns
      table.integer('total_seats').notNullable();
      table.integer('usable_seats').notNullable();
      table.string('file_path', 500);
      table.integer('created_by').unsigned().notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('room_id').references('id').inTable('rooms').onDelete('CASCADE');
      table.foreign('created_by').references('id').inTable('users');
      table.index('room_id', 'idx_blueprint_room');
    })
    // User preferences/dashboard config
    .createTable('user_preferences', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.json('dashboard_config');
      table.json('notification_settings');
      table.string('theme', 20).defaultTo('light');
      table.string('language', 10).defaultTo('en');
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.unique('user_id');
    })
    // System notifications (for users)
    .createTable('user_notifications', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('notification_id').unsigned();
      table.string('title', 255).notNullable();
      table.text('message').notNullable();
      table.enum('type', ['info', 'warning', 'success', 'error']).defaultTo('info');
      table.boolean('is_read').defaultTo(false);
      table.timestamp('read_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('notification_id').references('id').inTable('notifications').onDelete('CASCADE');
      table.index(['user_id', 'is_read'], 'idx_user_notifications');
    })
    // Course enrollment
    .createTable('course_enrollments', function(table) {
      table.increments('id').primary();
      table.integer('student_id').unsigned().notNullable();
      table.integer('course_id').unsigned().notNullable();
      table.integer('semester').notNullable();
      table.integer('year').notNullable();
      table.enum('status', ['enrolled', 'completed', 'dropped', 'failed']).defaultTo('enrolled');
      table.timestamp('enrolled_at').defaultTo(knex.fn.now());
      
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.unique(['student_id', 'course_id', 'semester', 'year'], 'unique_enrollment');
      table.index(['student_id', 'status'], 'idx_student_enrollment');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('course_enrollments')
    .dropTableIfExists('user_notifications')
    .dropTableIfExists('user_preferences')
    .dropTableIfExists('seating_blueprints')
    .dropTableIfExists('event_change_log')
    .dropTableIfExists('event_participants')
    .dropTableIfExists('mind_maps')
    .dropTableIfExists('student_academic_status')
    .dropTableIfExists('bulk_uploads')
    .dropTableIfExists('hall_tickets');
};
