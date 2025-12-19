const db = require('../config/database');

class ClubService {
  /**
   * Get club dashboard
   */
  async getDashboard(clubId) {
    try {
      const [clubs] = await db.query('SELECT * FROM clubs WHERE id = ?', [clubId]);
      
      if (clubs.length === 0) {
        throw new Error('Club not found');
      }

      const [memberCount] = await db.query(`
        SELECT COUNT(*) as count FROM club_members WHERE club_id = ?
      `, [clubId]);

      // Count general events (not club-specific since events table doesn't have club_id)
      const [upcomingEvents] = await db.query(`
        SELECT COUNT(*) as count FROM events 
        WHERE event_date >= CURDATE() AND status = 'approved'
      `);

      // Check if club_achievements table exists
      let achievementCount = 0;
      try {
        const [achievements] = await db.query(`
          SELECT COUNT(*) as count FROM club_achievements WHERE club_id = ?
        `, [clubId]);
        achievementCount = achievements[0].count;
      } catch (error) {
        // Table doesn't exist or column doesn't exist, return 0
        console.log('Club achievements query failed (table may not exist):', error.message);
        achievementCount = 0;
      }

      return {
        club: clubs[0],
        memberCount: memberCount[0].count,
        upcomingEvents: upcomingEvents[0].count,
        achievementCount: achievementCount
      };
    } catch (error) {
      console.error('Error in getDashboard:', error.message);
      console.error('Query that failed:', error.sql);
      throw error;
    }
  }

  /**
   * Get club members
   */
  async getMembers(clubId) {
    const [members] = await db.query(`
      SELECT cm.*, s.roll_number, u.first_name, u.last_name, u.email
      FROM club_members cm
      JOIN students s ON cm.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE cm.club_id = ?
      ORDER BY cm.role, u.first_name
    `, [clubId]);

    return members;
  }

  /**
   * Add member
   */
  async addMember(clubId, studentId, role = 'member') {
    const [result] = await db.query(`
      INSERT INTO club_members (club_id, student_id, role, joined_date)
      VALUES (?, ?, ?, CURDATE())
    `, [clubId, studentId, role]);

    return result.insertId;
  }

  /**
   * Remove member
   */
  async removeMember(clubId, studentId) {
    const [result] = await db.query(`
      DELETE FROM club_members WHERE club_id = ? AND student_id = ?
    `, [clubId, studentId]);

    return result.affectedRows > 0;
  }

  /**
   * Update member role
   */
  async updateMemberRole(clubId, studentId, role) {
    const [result] = await db.query(`
      UPDATE club_members SET role = ? WHERE club_id = ? AND student_id = ?
    `, [role, clubId, studentId]);

    return result.affectedRows > 0;
  }

  /**
   * Create event
   * Note: Using general events table structure (location, expected_attendance, submitted_by)
   */
  async createEvent(clubId, data) {
    const { title, description, eventDate, startTime, endTime, venue, maxParticipants, createdBy } = data;

    const [result] = await db.query(`
      INSERT INTO events
      (title, description, event_date, start_time, end_time, location, expected_attendance, status, submitted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [title, description, eventDate, startTime, endTime, venue || 'TBD', maxParticipants || 50, createdBy]);

    return result.insertId;
  }

  /**
   * Update event (with change tracking)
   */
  async updateEvent(eventId, data, updatedBy) {
    // Get current event data
    const [currentEvent] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    
    if (currentEvent.length === 0) {
      throw new Error('Event not found');
    }

    const oldData = currentEvent[0];
    const changes = {};

    // Track changes
    if (data.title && data.title !== oldData.title) {
      changes.title = { old: oldData.title, new: data.title };
    }
    if (data.eventDate && data.eventDate !== oldData.event_date) {
      changes.event_date = { old: oldData.event_date, new: data.eventDate };
    }
    if (data.startTime && data.startTime !== oldData.start_time) {
      changes.start_time = { old: oldData.start_time, new: data.startTime };
    }
    if (data.endTime && data.endTime !== oldData.end_time) {
      changes.end_time = { old: oldData.end_time, new: data.endTime };
    }
    if (data.venue && data.venue !== oldData.venue) {
      changes.venue = { old: oldData.venue, new: data.venue };
    }

    // Log changes
    if (Object.keys(changes).length > 0) {
      await db.query(`
        INSERT INTO event_change_log
        (event_id, changed_by, change_type, old_value, new_value)
        VALUES (?, ?, 'update', ?, ?)
      `, [eventId, updatedBy, JSON.stringify(oldData), JSON.stringify(data)]);
    }

    // Update event
    const fields = [];
    const params = [];

    if (data.title) {
      fields.push('title = ?');
      params.push(data.title);
    }
    if (data.description) {
      fields.push('description = ?');
      params.push(data.description);
    }
    if (data.eventDate) {
      fields.push('event_date = ?');
      params.push(data.eventDate);
    }
    if (data.startTime) {
      fields.push('start_time = ?');
      params.push(data.startTime);
    }
    if (data.endTime) {
      fields.push('end_time = ?');
      params.push(data.endTime);
    }
    if (data.venue) {
      fields.push('venue = ?');
      params.push(data.venue);
    }
    if (data.status) {
      fields.push('status = ?');
      params.push(data.status);
    }

    if (fields.length > 0) {
      params.push(eventId);
      await db.query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    // Notify participants if significant changes
    if (changes.event_date || changes.start_time || changes.venue) {
      await this.notifyParticipants(eventId, 'Event Updated', 
        `The event "${oldData.title}" has been updated. Please check the new details.`);
    }

    return { updated: true, changes };
  }

  /**
   * Cancel event
   */
  async cancelEvent(eventId, cancelledBy, reason) {
    // Get event details
    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    
    if (events.length === 0) {
      throw new Error('Event not found');
    }

    const event = events[0];

    // Log cancellation
    await db.query(`
      INSERT INTO event_change_log
      (event_id, changed_by, change_type, old_value, new_value)
      VALUES (?, ?, 'cancel', ?, ?)
    `, [eventId, cancelledBy, JSON.stringify(event), reason]);

    // Update event status
    await db.query(`
      UPDATE events SET status = 'cancelled' WHERE id = ?
    `, [eventId]);

    // Notify all participants
    await this.notifyParticipants(eventId, 'Event Cancelled', 
      `The event "${event.title}" has been cancelled. Reason: ${reason}`);

    return true;
  }

  /**
   * Notify event participants
   */
  async notifyParticipants(eventId, title, message) {
    // Get all participants
    const [participants] = await db.query(`
      SELECT ep.student_id, u.id as user_id
      FROM event_participants ep
      JOIN students s ON ep.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ep.event_id = ?
    `, [eventId]);

    if (participants.length === 0) return 0;

    // Create notifications
    const notifications = participants.map(p => [
      p.user_id,
      null,
      title,
      message,
      'warning',
      false
    ]);

    await db.query(`
      INSERT INTO user_notifications
      (user_id, notification_id, title, message, type, is_read)
      VALUES ?
    `, [notifications]);

    return participants.length;
  }

  /**
   * Get club events
   * Note: events table doesn't have club_id, so returning all general events
   */
  async getEvents(clubId, includeHistory = false) {
    let query = `
      SELECT e.*, 
             u.first_name as submitted_by_name, 
             u.last_name as submitted_by_lastname
      FROM events e
      LEFT JOIN users u ON e.submitted_by = u.id
      WHERE 1=1
    `;

    if (!includeHistory) {
      query += ' AND e.event_date >= CURDATE()';
    }

    query += ' ORDER BY e.event_date DESC';

    const [events] = await db.query(query);
    return events;
  }

  /**
   * Get event participants
   */
  async getEventParticipants(eventId) {
    const [participants] = await db.query(`
      SELECT ep.*, s.roll_number, u.first_name, u.last_name, u.email
      FROM event_participants ep
      JOIN students s ON ep.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ep.event_id = ?
      ORDER BY ep.registered_at
    `, [eventId]);

    return participants;
  }

  /**
   * Approve event invitation
   */
  async approveParticipant(eventId, studentId) {
    const [result] = await db.query(`
      UPDATE event_participants
      SET status = 'approved'
      WHERE event_id = ? AND student_id = ?
    `, [eventId, studentId]);

    return result.affectedRows > 0;
  }

  /**
   * Record achievement
   */
  async recordAchievement(clubId, data) {
    const { title, description, achievementDate, category, recordedBy } = data;

    const [result] = await db.query(`
      INSERT INTO club_achievements
      (club_id, title, description, achievement_date, category, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [clubId, title, description, achievementDate, category, recordedBy]);

    return result.insertId;
  }

  /**
   * Get club achievements
   */
  async getAchievements(clubId) {
    const [achievements] = await db.query(`
      SELECT * FROM club_achievements
      WHERE club_id = ?
      ORDER BY achievement_date DESC
    `, [clubId]);

    return achievements;
  }

  /**
   * Get event change log
   */
  async getEventChangeLog(eventId) {
    const [logs] = await db.query(`
      SELECT ecl.*, u.first_name, u.last_name
      FROM event_change_log ecl
      JOIN users u ON ecl.changed_by = u.id
      WHERE ecl.event_id = ?
      ORDER BY ecl.changed_at DESC
    `, [eventId]);

    return logs;
  }

  /**
   * Upload event document
   */
  async uploadEventDocument(eventId, data) {
    const { documentType, filePath, uploadedBy } = data;

    const [result] = await db.query(`
      INSERT INTO event_documents
      (event_id, document_type, file_path, uploaded_by)
      VALUES (?, ?, ?, ?)
    `, [eventId, documentType, filePath, uploadedBy]);

    return result.insertId;
  }

  /**
   * Get all clubs
   */
  async getAllClubs() {
    const [clubs] = await db.query(`
      SELECT c.*, COUNT(cm.id) as member_count
      FROM clubs c
      LEFT JOIN club_members cm ON c.id = cm.club_id
      GROUP BY c.id
      ORDER BY c.name
    `);

    return clubs;
  }
}

module.exports = new ClubService();
