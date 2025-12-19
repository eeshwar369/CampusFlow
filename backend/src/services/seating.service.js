const db = require('../config/database');

class SeatingService {
  /**
   * Allocate seats for an exam
   */
  async allocateSeats(examId, options = {}) {
    const { excludeDetained = true, spacing = 1 } = options;

    // Get exam details
    const [exams] = await db.query('SELECT * FROM exams WHERE id = ?', [examId]);
    if (exams.length === 0) {
      throw new Error('Exam not found');
    }

    // Get eligible students
    let studentQuery = `
      SELECT DISTINCT s.id, s.roll_number
      FROM students s
      JOIN course_enrollments ce ON s.id = ce.student_id
      JOIN exams e ON ce.course_id = e.course_id
      WHERE e.id = ?
    `;

    if (excludeDetained) {
      studentQuery += `
        AND s.id NOT IN (
          SELECT student_id FROM student_academic_status
          WHERE status = 'detained'
        )
      `;
    }

    studentQuery += ' ORDER BY s.roll_number';

    const [students] = await db.query(studentQuery, [examId]);

    if (students.length === 0) {
      throw new Error('No eligible students found');
    }

    // Get available rooms
    const [rooms] = await db.query(`
      SELECT * FROM rooms WHERE is_available = true
      ORDER BY capacity DESC
    `);

    if (rooms.length === 0) {
      throw new Error('No rooms available');
    }

    // Calculate effective capacity with spacing
    const effectiveCapacity = rooms.reduce((sum, room) => {
      return sum + Math.floor(room.capacity / spacing);
    }, 0);

    if (effectiveCapacity < students.length) {
      throw new Error(`Insufficient capacity. Need ${students.length} seats, have ${effectiveCapacity}`);
    }

    // Allocate seats
    const allocations = [];
    let studentIndex = 0;

    for (const room of rooms) {
      const roomCapacity = Math.floor(room.capacity / spacing);
      
      for (let seat = 1; seat <= roomCapacity && studentIndex < students.length; seat++) {
        const student = students[studentIndex];
        const seatNumber = `${room.room_name}-${seat}`;

        allocations.push([
          examId,
          student.id,
          room.id,
          seatNumber,
          seat
        ]);

        studentIndex++;
      }

      if (studentIndex >= students.length) break;
    }

    // Insert allocations
    if (allocations.length > 0) {
      await db.query(`
        INSERT INTO seating_allocations
        (exam_id, student_id, room_id, seat_number, seat_position)
        VALUES ?
      `, [allocations]);
    }

    // Count excluded detained students
    const [detainedCount] = await db.query(`
      SELECT COUNT(*) as count FROM student_academic_status
      WHERE status = 'detained'
    `);

    return {
      examId,
      totalStudents: students.length,
      allocated: allocations.length,
      excluded: excludeDetained ? detainedCount[0].count : 0,
      roomsUsed: Math.ceil(allocations.length / (rooms[0]?.capacity || 1))
    };
  }

  /**
   * Get seating chart for an exam
   */
  async getSeatingChart(examId) {
    const [allocations] = await db.query(`
      SELECT sa.*, s.roll_number, u.first_name, u.last_name,
             r.room_name, r.building, r.floor, r.capacity
      FROM seating_allocations sa
      JOIN students s ON sa.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN rooms r ON sa.room_id = r.id
      WHERE sa.exam_id = ?
      ORDER BY r.room_name, sa.seat_position
    `, [examId]);

    // Group by room
    const rooms = [];
    const roomMap = {};
    
    allocations.forEach(allocation => {
      if (!roomMap[allocation.room_name]) {
        roomMap[allocation.room_name] = {
          room_name: allocation.room_name,
          building: allocation.building,
          floor: allocation.floor,
          capacity: allocation.capacity,
          students: []
        };
        rooms.push(roomMap[allocation.room_name]);
      }
      
      roomMap[allocation.room_name].students.push({
        seat_number: allocation.seat_number,
        seat_position: allocation.seat_position,
        roll_number: allocation.roll_number,
        name: `${allocation.first_name} ${allocation.last_name}`
      });
    });

    return { rooms };
  }

  /**
   * Upload seating blueprint
   */
  async uploadBlueprint(data) {
    const { roomId, examId, blueprintData, uploadedBy } = data;

    const [result] = await db.query(`
      INSERT INTO seating_blueprints
      (room_id, exam_id, blueprint_data, uploaded_by)
      VALUES (?, ?, ?, ?)
    `, [roomId, examId, JSON.stringify(blueprintData), uploadedBy]);

    return result.insertId;
  }

  /**
   * Analyze seating blueprint
   */
  async analyzeBlueprint(blueprintId) {
    const [blueprints] = await db.query(`
      SELECT * FROM seating_blueprints WHERE id = ?
    `, [blueprintId]);

    if (blueprints.length === 0) {
      throw new Error('Blueprint not found');
    }

    const blueprint = blueprints[0];
    const data = JSON.parse(blueprint.blueprint_data);

    // Analyze blueprint
    const analysis = {
      totalSeats: data.seats ? data.seats.length : 0,
      usableSeats: data.seats ? data.seats.filter(s => s.usable).length : 0,
      rows: data.rows || 0,
      columns: data.columns || 0,
      spacing: data.spacing || 'standard',
      recommendations: []
    };

    // Add recommendations
    if (analysis.usableSeats < analysis.totalSeats * 0.8) {
      analysis.recommendations.push('Consider increasing usable seats');
    }

    if (data.spacing === 'tight') {
      analysis.recommendations.push('Spacing is tight, consider social distancing');
    }

    return analysis;
  }

  /**
   * Get seating configuration
   */
  async getConfiguration(examId) {
    const [configs] = await db.query(`
      SELECT * FROM seating_configurations WHERE exam_id = ?
    `, [examId]);

    return configs.length > 0 ? configs[0] : null;
  }

  /**
   * Save seating configuration
   */
  async saveConfiguration(data) {
    const { examId, spacing, excludeDetained, randomize, configData } = data;

    // Check if exists
    const [existing] = await db.query(`
      SELECT id FROM seating_configurations WHERE exam_id = ?
    `, [examId]);

    if (existing.length > 0) {
      // Update
      await db.query(`
        UPDATE seating_configurations
        SET spacing = ?, exclude_detained = ?, randomize = ?, config_data = ?
        WHERE exam_id = ?
      `, [spacing, excludeDetained, randomize, JSON.stringify(configData), examId]);
      return existing[0].id;
    } else {
      // Insert
      const [result] = await db.query(`
        INSERT INTO seating_configurations
        (exam_id, spacing, exclude_detained, randomize, config_data)
        VALUES (?, ?, ?, ?, ?)
      `, [examId, spacing, excludeDetained, randomize, JSON.stringify(configData)]);
      return result.insertId;
    }
  }

  /**
   * Get room availability
   */
  async getRoomAvailability(date, startTime, endTime) {
    const [rooms] = await db.query(`
      SELECT r.*, 
             CASE WHEN EXISTS (
               SELECT 1 FROM seating_allocations sa
               JOIN exams e ON sa.exam_id = e.id
               WHERE sa.room_id = r.id
               AND e.exam_date = ?
               AND e.start_time < ?
               AND e.end_time > ?
             ) THEN false ELSE true END as available
      FROM rooms r
      WHERE r.is_available = true
    `, [date, endTime, startTime]);

    return rooms;
  }

  /**
   * Clear seating allocations
   */
  async clearAllocations(examId) {
    const [result] = await db.query(`
      DELETE FROM seating_allocations WHERE exam_id = ?
    `, [examId]);

    return result.affectedRows;
  }

  /**
   * Get student seat
   */
  async getStudentSeat(studentId, examId) {
    const [allocations] = await db.query(`
      SELECT sa.*, r.room_name, r.building, r.floor
      FROM seating_allocations sa
      JOIN rooms r ON sa.room_id = r.id
      WHERE sa.student_id = ? AND sa.exam_id = ?
    `, [studentId, examId]);

    return allocations.length > 0 ? allocations[0] : null;
  }
}

module.exports = new SeatingService();
