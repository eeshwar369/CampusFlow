exports.up = function(knex) {
  return knex.schema
    // Update users table to include faculty role (already has the enum, just documenting)
    // Add faculty table
    .createTable('faculty', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.string('employee_id', 50).notNullable().unique();
      table.string('department', 100).notNullable();
      table.string('designation', 100).notNullable();
      table.string('specialization', 255);
      table.string('qualification', 255);
      table.date('joining_date');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.index('employee_id', 'idx_employee_id');
      table.index('department', 'idx_faculty_department');
    })
    // Course materials table
    .createTable('course_materials', function(table) {
      table.increments('id').primary();
      table.integer('course_id').unsigned().notNullable();
      table.integer('uploaded_by').unsigned().notNullable();
      table.string('title', 255).notNullable();
      table.text('description');
      table.enum('material_type', ['lecture_notes', 'assignment', 'reference', 'video', 'other']).notNullable();
      table.string('file_path', 500).notNullable();
      table.string('file_name', 255).notNullable();
      table.integer('file_size').notNullable();
      table.timestamp('uploaded_at').defaultTo(knex.fn.now());
      
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.foreign('uploaded_by').references('id').inTable('users');
      table.index('course_id', 'idx_material_course');
    })
    // Notifications/Circulars table
    .createTable('notifications', function(table) {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.text('content').notNullable();
      table.enum('type', ['circular', 'announcement', 'alert', 'reminder']).notNullable();
      table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
      table.json('target_roles'); // ['student', 'faculty', 'admin']
      table.integer('created_by').unsigned().notNullable();
      table.boolean('is_published').defaultTo(false);
      table.timestamp('published_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('created_by').references('id').inTable('users');
      table.index('type', 'idx_notification_type');
      table.index('is_published', 'idx_is_published');
    })
    // Attendance table
    .createTable('attendance', function(table) {
      table.increments('id').primary();
      table.integer('student_id').unsigned().notNullable();
      table.integer('course_id').unsigned().notNullable();
      table.date('attendance_date').notNullable();
      table.enum('status', ['present', 'absent', 'late', 'excused']).notNullable();
      table.integer('marked_by').unsigned().notNullable();
      table.text('remarks');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.foreign('marked_by').references('id').inTable('users');
      table.unique(['student_id', 'course_id', 'attendance_date'], 'unique_attendance');
      table.index(['student_id', 'course_id'], 'idx_student_course_attendance');
    })
    // Assignments table
    .createTable('assignments', function(table) {
      table.increments('id').primary();
      table.integer('course_id').unsigned().notNullable();
      table.integer('created_by').unsigned().notNullable();
      table.string('title', 255).notNullable();
      table.text('description').notNullable();
      table.date('due_date').notNullable();
      table.integer('max_marks').notNullable();
      table.string('file_path', 500);
      table.boolean('is_published').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.foreign('created_by').references('id').inTable('users');
      table.index('course_id', 'idx_assignment_course');
    })
    // Assignment submissions table
    .createTable('assignment_submissions', function(table) {
      table.increments('id').primary();
      table.integer('assignment_id').unsigned().notNullable();
      table.integer('student_id').unsigned().notNullable();
      table.string('file_path', 500).notNullable();
      table.string('file_name', 255).notNullable();
      table.text('comments');
      table.integer('marks_obtained');
      table.text('faculty_feedback');
      table.timestamp('submitted_at').defaultTo(knex.fn.now());
      table.timestamp('graded_at').nullable();
      
      table.foreign('assignment_id').references('id').inTable('assignments').onDelete('CASCADE');
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
      table.unique(['assignment_id', 'student_id'], 'unique_submission');
      table.index(['assignment_id', 'student_id'], 'idx_assignment_student');
    })
    // Faculty feedback table
    .createTable('faculty_feedback', function(table) {
      table.increments('id').primary();
      table.integer('faculty_id').unsigned().notNullable();
      table.integer('student_id').unsigned().notNullable();
      table.integer('course_id').unsigned().notNullable();
      table.integer('rating').notNullable(); // 1-5
      table.text('comments');
      table.boolean('is_anonymous').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('faculty_id').references('id').inTable('users');
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.index(['faculty_id', 'course_id'], 'idx_faculty_course_feedback');
    })
    // Fee payments table
    .createTable('fee_payments', function(table) {
      table.increments('id').primary();
      table.integer('student_id').unsigned().notNullable();
      table.decimal('amount', 10, 2).notNullable();
      table.enum('payment_type', ['tuition', 'exam', 'library', 'hostel', 'other']).notNullable();
      table.string('transaction_id', 100);
      table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
      table.integer('approved_by').unsigned();
      table.text('remarks');
      table.timestamp('payment_date').defaultTo(knex.fn.now());
      table.timestamp('approved_at').nullable();
      
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
      table.foreign('approved_by').references('id').inTable('users');
      table.index('student_id', 'idx_payment_student');
      table.index('status', 'idx_payment_status');
    })
    // Timetable table
    .createTable('timetable', function(table) {
      table.increments('id').primary();
      table.integer('course_id').unsigned().notNullable();
      table.integer('faculty_id').unsigned();
      table.enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).notNullable();
      table.time('start_time').notNullable();
      table.time('end_time').notNullable();
      table.string('room_number', 50);
      table.string('semester', 20).notNullable();
      table.integer('year').notNullable();
      table.boolean('is_active').defaultTo(true);
      
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.foreign('faculty_id').references('id').inTable('users');
      table.index(['course_id', 'semester', 'year'], 'idx_timetable_course');
    })
    // Clubs table
    .createTable('clubs', function(table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable().unique();
      table.text('description');
      table.string('category', 100); // technical, cultural, sports, etc.
      table.integer('coordinator_id').unsigned().notNullable();
      table.string('logo_path', 500);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('coordinator_id').references('id').inTable('users');
      table.index('coordinator_id', 'idx_club_coordinator');
    })
    // Club members table
    .createTable('club_members', function(table) {
      table.increments('id').primary();
      table.integer('club_id').unsigned().notNullable();
      table.integer('student_id').unsigned().notNullable();
      table.enum('role', ['member', 'secretary', 'president', 'vice_president']).defaultTo('member');
      table.date('joined_date');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('club_id').references('id').inTable('clubs').onDelete('CASCADE');
      table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
      table.unique(['club_id', 'student_id'], 'unique_club_member');
      table.index('club_id', 'idx_club_members');
    })
    // Club achievements table
    .createTable('club_achievements', function(table) {
      table.increments('id').primary();
      table.integer('club_id').unsigned().notNullable();
      table.string('title', 255).notNullable();
      table.text('description');
      table.date('achievement_date');
      table.string('certificate_path', 500);
      table.integer('created_by').unsigned().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('club_id').references('id').inTable('clubs').onDelete('CASCADE');
      table.foreign('created_by').references('id').inTable('users');
      table.index('club_id', 'idx_club_achievements');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('club_achievements')
    .dropTableIfExists('club_members')
    .dropTableIfExists('clubs')
    .dropTableIfExists('timetable')
    .dropTableIfExists('fee_payments')
    .dropTableIfExists('faculty_feedback')
    .dropTableIfExists('assignment_submissions')
    .dropTableIfExists('assignments')
    .dropTableIfExists('attendance')
    .dropTableIfExists('notifications')
    .dropTableIfExists('course_materials')
    .dropTableIfExists('faculty');
};
