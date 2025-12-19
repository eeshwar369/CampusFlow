exports.up = async function(knex) {
  // Add 'faculty' to the role enum
  await knex.raw(`
    ALTER TABLE users 
    MODIFY COLUMN role ENUM('student', 'admin', 'seating_manager', 'club_coordinator', 'faculty') NOT NULL
  `);
};

exports.down = async function(knex) {
  // Remove 'faculty' from the role enum
  await knex.raw(`
    ALTER TABLE users 
    MODIFY COLUMN role ENUM('student', 'admin', 'seating_manager', 'club_coordinator') NOT NULL
  `);
};
