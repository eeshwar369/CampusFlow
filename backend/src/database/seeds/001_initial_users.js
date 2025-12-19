const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Delete existing entries
  await knex('users').del();
  
  // Hash passwords
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const studentPassword = await bcrypt.hash('student123', saltRounds);
  const seatingPassword = await bcrypt.hash('seating123', saltRounds);
  const clubPassword = await bcrypt.hash('club123', saltRounds);
  
  // Insert seed entries
  await knex('users').insert([
    {
      id: 1,
      email: 'admin@university.edu',
      password_hash: adminPassword,
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      is_active: true
    },
    {
      id: 2,
      email: 'student@university.edu',
      password_hash: studentPassword,
      role: 'student',
      first_name: 'John',
      last_name: 'Doe',
      is_active: true
    },
    {
      id: 3,
      email: 'seating@university.edu',
      password_hash: seatingPassword,
      role: 'seating_manager',
      first_name: 'Seating',
      last_name: 'Manager',
      is_active: true
    },
    {
      id: 4,
      email: 'club@university.edu',
      password_hash: clubPassword,
      role: 'club_coordinator',
      first_name: 'Club',
      last_name: 'Coordinator',
      is_active: true
    }
  ]);
  
  // Insert student record
  await knex('students').insert([
    {
      id: 1,
      user_id: 2,
      roll_number: 'CS2024001',
      department: 'Computer Science',
      year: 2024,
      semester: 1
    }
  ]);
};
