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
    
    // Get additional role-specific IDs
    const db = require('../config/database');
    
    if (decoded.role === 'student') {
      const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [decoded.id]);
      if (students.length > 0) {
        req.user.studentId = students[0].id;
      }
    } else if (decoded.role === 'faculty') {
      const [faculty] = await db.query('SELECT id FROM faculty WHERE user_id = ?', [decoded.id]);
      if (faculty.length > 0) {
        req.user.facultyId = faculty[0].id;
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
  return (req, res, next) => {
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

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        },
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

module.exports = {
  authenticate: verifyToken,
  authorize: checkRole,
  verifyToken,
  checkRole
};
