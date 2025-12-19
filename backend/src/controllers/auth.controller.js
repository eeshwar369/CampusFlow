const authService = require('../services/auth.service');
const auditLogService = require('../services/auditLog.service');

class AuthController {
  /**
   * Login endpoint
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Attempt login
      const result = await authService.login(email, password);

      // Log authentication
      await auditLogService.logAuthentication(
        result.user.id,
        'LOGIN',
        req.ip,
        req.headers['user-agent']
      );

      return res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Log failed login attempt
      await auditLogService.logAuthentication(
        null,
        'LOGIN_FAILED',
        req.ip,
        req.headers['user-agent']
      );

      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Logout endpoint
   */
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.substring(7);
      
      if (token) {
        await authService.invalidateToken(token);
      }

      // Log logout
      if (req.user) {
        await auditLogService.logAuthentication(
          req.user.id,
          'LOGOUT',
          req.ip,
          req.headers['user-agent']
        );
      }

      return res.json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Verify token endpoint
   */
  async verify(req, res) {
    try {
      // If we reach here, token is valid (verified by middleware)
      return res.json({
        success: true,
        data: {
          user: req.user,
          valid: true
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token verification failed'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Refresh token endpoint
   */
  async refresh(req, res) {
    try {
      // Generate new token with same user data
      const newToken = authService.generateToken(req.user);

      return res.json({
        success: true,
        data: {
          token: newToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'REFRESH_ERROR',
          message: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new AuthController();
