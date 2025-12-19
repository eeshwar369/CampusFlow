const db = require('../config/database');

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(data) {
    const { title, content, type, priority, targetRoles, createdBy } = data;

    const [result] = await db.query(`
      INSERT INTO notifications 
      (title, content, type, priority, target_roles, created_by, is_published)
      VALUES (?, ?, ?, ?, ?, ?, false)
    `, [title, content, type, priority, JSON.stringify(targetRoles), createdBy]);

    return result.insertId;
  }

  /**
   * Publish notification
   */
  async publishNotification(notificationId) {
    // Update notification status
    await db.query(`
      UPDATE notifications 
      SET is_published = true, published_at = NOW()
      WHERE id = ?
    `, [notificationId]);

    // Get notification details
    const [notifications] = await db.query(`
      SELECT * FROM notifications WHERE id = ?
    `, [notificationId]);

    if (notifications.length === 0) {
      throw new Error('Notification not found');
    }

    const notification = notifications[0];
    const targetRoles = JSON.parse(notification.target_roles);

    // Get all users with target roles
    const [users] = await db.query(`
      SELECT id FROM users WHERE role IN (?) AND is_active = true
    `, [targetRoles]);

    // Create user notifications
    const userNotifications = users.map(user => [
      user.id,
      notificationId,
      notification.title,
      notification.content,
      'info',
      false
    ]);

    if (userNotifications.length > 0) {
      await db.query(`
        INSERT INTO user_notifications 
        (user_id, notification_id, title, message, type, is_read)
        VALUES ?
      `, [userNotifications]);
    }

    return { notificationId, usersNotified: users.length };
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, unreadOnly = false) {
    let query = `
      SELECT un.*, n.type as notification_type, n.priority
      FROM user_notifications un
      LEFT JOIN notifications n ON un.notification_id = n.id
      WHERE un.user_id = ?
    `;

    if (unreadOnly) {
      query += ' AND un.is_read = false';
    }

    query += ' ORDER BY un.created_at DESC LIMIT 50';

    const [notifications] = await db.query(query, [userId]);
    return notifications;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const [result] = await db.query(`
      UPDATE user_notifications 
      SET is_read = true, read_at = NOW()
      WHERE id = ? AND user_id = ?
    `, [notificationId, userId]);

    return result.affectedRows > 0;
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId) {
    const [result] = await db.query(`
      UPDATE user_notifications 
      SET is_read = true, read_at = NOW()
      WHERE user_id = ? AND is_read = false
    `, [userId]);

    return result.affectedRows;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const [result] = await db.query(`
      SELECT COUNT(*) as count 
      FROM user_notifications 
      WHERE user_id = ? AND is_read = false
    `, [userId]);

    return result[0].count;
  }

  /**
   * Send notification to specific users
   */
  async sendToUsers(userIds, title, message, type = 'info') {
    const notifications = userIds.map(userId => [
      userId,
      null,
      title,
      message,
      type,
      false
    ]);

    if (notifications.length > 0) {
      await db.query(`
        INSERT INTO user_notifications 
        (user_id, notification_id, title, message, type, is_read)
        VALUES ?
      `, [notifications]);
    }

    return notifications.length;
  }

  /**
   * Get all published notifications (for admin)
   */
  async getAllNotifications(filters = {}) {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.isPublished !== undefined) {
      query += ' AND is_published = ?';
      params.push(filters.isPublished);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [notifications] = await db.query(query, params);
    return notifications;
  }
}

module.exports = new NotificationService();
