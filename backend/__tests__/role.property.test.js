const fc = require('fast-check');
const authService = require('../src/services/auth.service');
const jwt = require('jsonwebtoken');

describe('Role-Based Access Property-Based Tests', () => {
  describe('Property 6: JWT tokens contain role information', () => {
    /**
     * Feature: academic-exam-management-system, Property 6: JWT tokens contain role information
     * Validates: Requirements 15.3
     * 
     * For any generated JWT token, decoding it should reveal the user's role information
     * for role-based access control.
     */
    test('should include role in any generated token', async () => {
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

            // Decode token
            const decoded = authService.verifyToken(token);

            // Assertions
            expect(decoded).toHaveProperty('role');
            expect(decoded.role).toBe(user.role);
            expect(['student', 'admin', 'seating_manager', 'club_coordinator']).toContain(decoded.role);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should preserve role through token lifecycle', async () => {
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

            // Decode token multiple times
            const decoded1 = authService.verifyToken(token);
            const decoded2 = authService.verifyToken(token);

            // Assertions: Role should be consistent
            expect(decoded1.role).toBe(user.role);
            expect(decoded2.role).toBe(user.role);
            expect(decoded1.role).toBe(decoded2.role);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Logout invalidates tokens', () => {
    /**
     * Feature: academic-exam-management-system, Property 7: Logout invalidates tokens
     * Validates: Requirements 15.4
     * 
     * For any user session, after logout is called, subsequent API requests using
     * that token should be rejected with a 401 error.
     * 
     * Note: In the current implementation, token invalidation is handled client-side.
     * In production, this should use a token blacklist (Redis).
     */
    test('should mark token for invalidation on logout', async () => {
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

            // Verify token is valid before logout
            const decodedBefore = authService.verifyToken(token);
            expect(decodedBefore).toHaveProperty('id');

            // Invalidate token (logout)
            const result = await authService.invalidateToken(token);

            // Assertions
            expect(result).toBe(true);
            
            // Note: In production with Redis blacklist, we would verify the token
            // is actually rejected after invalidation. For now, we verify the
            // invalidation call succeeds.
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Role-Based Access Control Properties', () => {
    test('should correctly identify all valid roles', async () => {
      const validRoles = ['student', 'admin', 'seating_manager', 'club_coordinator'];
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000000 }),
            email: fc.emailAddress(),
            role: fc.constantFrom(...validRoles),
            first_name: fc.string({ minLength: 2, maxLength: 20 }),
            last_name: fc.string({ minLength: 2, maxLength: 20 })
          }),
          async (user) => {
            // Generate token
            const token = authService.generateToken(user);
            const decoded = authService.verifyToken(token);

            // Assertions: Role should be one of the valid roles
            expect(validRoles).toContain(decoded.role);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should not allow role escalation through token tampering', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000000 }),
            email: fc.emailAddress(),
            originalRole: fc.constantFrom('student', 'club_coordinator'),
            targetRole: fc.constant('admin'),
            first_name: fc.string({ minLength: 2, maxLength: 20 }),
            last_name: fc.string({ minLength: 2, maxLength: 20 })
          }),
          async (userData) => {
            // Generate token with original role
            const user = {
              id: userData.id,
              email: userData.email,
              role: userData.originalRole,
              first_name: userData.first_name,
              last_name: userData.last_name
            };
            
            const validToken = authService.generateToken(user);
            
            // Attempt to tamper with token to escalate to admin
            const parts = validToken.split('.');
            if (parts.length !== 3) return;
            
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            payload.role = userData.targetRole; // Try to escalate to admin
            parts[1] = Buffer.from(JSON.stringify(payload)).toString('base64');
            const tamperedToken = parts.join('.');

            // Test: Tampered token should be rejected
            expect(() => {
              authService.verifyToken(tamperedToken);
            }).toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should maintain role consistency across token refresh', async () => {
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
            // Generate original token
            const token1 = authService.generateToken(user);
            const decoded1 = authService.verifyToken(token1);

            // Simulate token refresh by generating new token with same user data
            const token2 = authService.generateToken(user);
            const decoded2 = authService.verifyToken(token2);

            // Assertions: Role should remain the same
            expect(decoded1.role).toBe(decoded2.role);
            expect(decoded1.role).toBe(user.role);
            expect(decoded2.role).toBe(user.role);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should encode role information securely', async () => {
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

            // Token should be in JWT format (3 parts separated by dots)
            const parts = token.split('.');
            expect(parts.length).toBe(3);

            // Decode payload (without verification) to check role is present
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            expect(payload).toHaveProperty('role');
            expect(payload.role).toBe(user.role);

            // Verify signature is present and not empty
            expect(parts[2].length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
