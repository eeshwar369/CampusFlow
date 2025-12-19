const db = require('../config/database');

class AuditLogService {
  /**
   * Log authentication operations
   * @param {number|null} userId - User ID (null for failed attempts)
   * @param {string} action - Action performed (LOGIN, LOGOUT, LOGIN_FAILED)
   * @param {string} ipAddress - IP address of the request
   * @param {string} userAgent - User agent string
   */
  async logAuthentication(userId, action, ipAddress, userAgent) {
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, ip_address, user_agent) 
         VALUES (?, ?, ?, ?)`,
        [userId, action, ipAddress, userAgent]
      );
    } catch (error) {
      console.error('Failed to log authentication:', error);
    }
  }

  /**
   * Log data change operations
   * @param {number} userId - User ID performing the action
   * @param {string} tableName - Table name
   * @param {string} action - Action performed (INSERT, UPDATE, DELETE)
   * @param {number} recordId - Record ID affected
   * @param {Object} oldValue - Old value (for UPDATE/DELETE)
   * @param {Object} newValue - New value (for INSERT/UPDATE)
   */
  async logDataChange(userId, tableName, action, recordId, oldValue = null, newValue = null) {
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          action,
          tableName,
          recordId,
          oldValue ? JSON.stringify(oldValue) : null,
          newValue ? JSON.stringify(newValue) : null
        ]
      );
    } catch (error) {
      console.error('Failed to log data change:', error);
    }
  }

  /**
   * Log seating allocation operations
   * @param {number} managerId - Seating manager ID
   * @param {number} examId - Exam ID
   * @param {Object} params - Allocation parameters
   * @param {Object} results - Allocation results
   */
  async logSeatingAllocation(managerId, examId, params, results) {
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          managerId,
          'SEATING_ALLOCATION',
          'seating_allocations',
          examId,
          JSON.stringify(params),
          JSON.stringify(results)
        ]
      );
    } catch (error) {
      console.error('Failed to log seating allocation:', error);
    }
  }

  /**
   * Log system errors
   * @param {Error} error - Error object
   * @param {Object} context - Additional context information
   */
  async logError(error, context = {}) {
    try {
      await db.query(
        `INSERT INTO audit_logs (action, old_value, new_value) 
         VALUES (?, ?, ?)`,
        [
          'ERROR',
          JSON.stringify({
            message: error.message,
            stack: error.stack,
            name: error.name
          }),
          JSON.stringify(context)
        ]
      );
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }

  /**
   * Get audit logs with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Audit logs
   */
  async getLogs(filters = {}) {
    try {
      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const params = [];

      if (filters.userId) {
        query += ' AND user_id = ?';
        params.push(filters.userId);
      }

      if (filters.action) {
        query += ' AND action = ?';
        params.push(filters.action);
      }

      if (filters.tableName) {
        query += ' AND table_name = ?';
        params.push(filters.tableName);
      }

      if (filters.startDate) {
        query += ' AND created_at >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND created_at <= ?';
        params.push(filters.endDate);
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }

      const [logs] = await db.query(query, params);
      return logs;
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      throw error;
    }
  }
}

module.exports = new AuditLogService();
