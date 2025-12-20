const authService = require('../services/auth.service');

/**
 * Middleware to verify JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'No token provided'
        },
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Attach user data to request
    req.user = decoded;
    
    // Get additional role-specific IDs and all roles
    const db = require('../config/database');
    
    // Get user's all roles from database
    const [users] = await db.query('SELECT role, roles FROM users WHERE id = ?', [decoded.id]);
    if (users.length > 0) {
      const user = users[0];
      let userRoles = [user.role];
      
      // Parse multiple roles if available
      if (user.roles) {
        try {
          const parsedRoles = typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles;
          if (Array.isArray(parsedRoles) && parsedRoles.length > 0) {
            userRoles = parsedRoles;
          }
        } catch (e) {
          console.error('Error parsing user roles:', e);
        }
      }
      
      req.user.allRoles = userRoles;
      
      // Get role-specific IDs for all roles user has
      if (userRoles.includes('student')) {
        const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [decoded.id]);
        if (students.length > 0) {
          req.user.studentId = students[0].id;
        }
      }
      
      if (userRoles.includes('faculty')) {
        const [faculty] = await db.query('SELECT id FROM faculty WHERE user_id = ?', [decoded.id]);
        if (faculty.length > 0) {
          req.user.facultyId = faculty[0].id;
        }
      }
    }
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        },
        timestamp: new Date().toISOString()
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication failed'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware to check user role
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Get user's all roles from database
    const db = require('../config/database');
    const [users] = await db.query('SELECT role, roles FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'User not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    const user = users[0];
    let userRoles = [user.role]; // Default to single role
    
    // Parse multiple roles if available
    if (user.roles) {
      try {
        const parsedRoles = typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles;
        if (Array.isArray(parsedRoles) && parsedRoles.length > 0) {
          userRoles = parsedRoles;
        }
      } catch (e) {
        console.error('Error parsing user roles:', e);
      }
    }

    // Check if user has any of the allowed roles
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Attach all user roles to request for further use
    req.user.allRoles = userRoles;
    
    next();
  };
};

module.exports = {
  authenticate: verifyToken,
  authorize: checkRole,
  verifyToken,
  checkRole
};
