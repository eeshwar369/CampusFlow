const fc = require('fast-check');
const authService = require('../src/services/auth.service');
const jwt = require('jsonwebtoken');

describe('Token Validation Property-Based Tests', () => {
  describe('Property 3: Expired tokens require re-authentication', () => {
    /**
     * Feature: academic-exam-management-system, Property 3: Expired tokens require re-authentication
     * Validates: Requirements 1.3
     * 
     * For any API endpoint, when a request is made with an expired JWT token,
     * the system should return a 401 unauthorized error and require re-authentication.
     */
    test('should reject any expired token', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000000 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('student', 'admin', 'seating_manager', 'club_coordinator'),
            first_name: fc.string({ minLength: 2, maxLength: 20 }),
            last_name: fc.string({ minLength: 2, maxLength: 20 })
          }),
          async (user) => {
            // Create an expired token (expired 1 hour ago)
            const expiredToken = jwt.sign(
              {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
              },
              process.env.JWT_SECRET || 'test_secret',
              { expiresIn: '-1h' } // Negative expiration = already expired
            );

            // Test: Verify expired token should throw error
            expect(() => {
              authService.verifyToken(expiredToken);
            }).toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: API requests require valid tokens', () => {
    /**
     * Feature: academic-exam-management-system, Property 8: API requests require valid tokens
     * Validates: Requirements 15.1
     * 
     * For any protected API endpoint, making a request without a valid JWT token
     * should result in a 401 unauthorized error.
     */
    test('should accept any valid token', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000000 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('student', 'admin', 'seating_manager', 'club_coordinator'),
            first_name: fc.string({ minLength: 2, maxLength: 20 }),
            last_name: fc.string({ minLength: 2, maxLength: 20 })
          }),
          async (user) => {
            // Generate valid token
            const token = authService.generateToken(user);

            // Test: Verify valid token should not throw
            const decoded = authService.verifyToken(token);

            // Assertions
            expect(decoded).toHaveProperty('id');
            expect(decoded).toHaveProperty('email');
            expect(decoded).toHaveProperty('role');
            expect(decoded.id).toBe(user.id);
            expect(decoded.email).toBe(user.email);
            expect(decoded.role).toBe(user.role);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: Invalid tokens return 401 errors', () => {
    /**
     * Feature: academic-exam-management-system, Property 9: Invalid tokens return 401 errors
     * Validates: Requirements 15.2
     * 
     * For any malformed, expired, or tampered JWT token,
     * API requests should return a 401 unauthorized error.
     */
    test('should reject any malformed token', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 100 }),
          async (malformedToken) => {
            // Skip if by chance it's a valid JWT format
            if (malformedToken.split('.').length === 3) {
              return;
            }

            // Test: Verify malformed token should throw error
            expect(() => {
              authService.verifyToken(malformedToken);
            }).toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject any token with wrong signature', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000000 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('student', 'admin', 'seating_manager', 'club_coordinator'),
            first_name: fc.string({ minLength: 2, maxLength: 20 }),
            last_name: fc.string({ minLength: 2, maxLength: 20 })
          }),
          async (user) => {
            // Create token with wrong secret
            const tamperedToken = jwt.sign(
              {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
              },
              'wrong_secret_key',
              { expiresIn: '24h' }
            );

            // Test: Verify tampered token should throw error
            expect(() => {
              authService.verifyToken(tamperedToken);
            }).toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject token with modified payload', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000000 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('student', 'admin', 'seating_manager', 'club_coordinator'),
            first_name: fc.string({ minLength: 2, maxLength: 20 }),
            last_name: fc.string({ minLength: 2, maxLength: 20 })
          }),
          async (user) => {
            // Generate valid token
            const validToken = authService.generateToken(user);
            
            // Tamper with the token by modifying the payload
            const parts = validToken.split('.');
            if (parts.length !== 3) return;
            
            // Decode payload, modify it, and re-encode
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            payload.role = 'admin'; // Try to escalate privileges
            parts[1] = Buffer.from(JSON.stringify(payload)).toString('base64');
            const tamperedToken = parts.join('.');

            // Test: Verify tampered token should throw error
            expect(() => {
              authService.verifyToken(tamperedToken);
            }).toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Token Consistency Properties', () => {
    test('should maintain user data integrity through token lifecycle', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000000 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('student', 'admin', 'seating_manager', 'club_coordinator'),
            first_name: fc.string({ minLength: 2, maxLength: 20 }),
            last_name: fc.string({ minLength: 2, maxLength: 20 })
          }),
          async (user) => {
            // Generate token
            const token = authService.generateToken(user);
            
            // Verify token
            const decoded = authService.verifyToken(token);

            // Assertions: All user data should be preserved
            expect(decoded.id).toBe(user.id);
            expect(decoded.email).toBe(user.email);
            expect(decoded.role).toBe(user.role);
            expect(decoded.firstName).toBe(user.first_name);
            expect(decoded.lastName).toBe(user.last_name);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should generate unique tokens for same user at different times', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000000 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('student', 'admin', 'seating_manager', 'club_coordinator'),
            first_name: fc.string({ minLength: 2, maxLength: 20 }),
            last_name: fc.string({ minLength: 2, maxLength: 20 })
          }),
          async (user) => {
            // Generate two tokens for the same user
            const token1 = authService.generateToken(user);
            
            // Small delay to ensure different iat (issued at) timestamp
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const token2 = authService.generateToken(user);

            // Assertions: Tokens should be different due to different iat
            expect(token1).not.toBe(token2);
            
            // But both should decode to the same user data
            const decoded1 = authService.verifyToken(token1);
            const decoded2 = authService.verifyToken(token2);
            
            expect(decoded1.id).toBe(decoded2.id);
            expect(decoded1.email).toBe(decoded2.email);
            expect(decoded1.role).toBe(decoded2.role);
          }
        ),
        { numRuns: 50 } // Reduced runs due to setTimeout
      );
    });
  });
});
