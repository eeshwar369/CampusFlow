const fc = require('fast-check');
const authService = require('../src/services/auth.service');
const db = require('../src/config/database');

describe('Authentication Property-Based Tests', () => {
  // Clean up database after tests
  afterAll(async () => {
    await db.end();
  });

  describe('Property 1: Valid credentials grant access', () => {
    /**
     * Feature: academic-exam-management-system, Property 1: Valid credentials grant access
     * Validates: Requirements 1.1
     * 
     * For any valid user credentials (email and password combination that exists in the database),
     * submitting them to the login endpoint should return a JWT token and grant access to the
     * appropriate role-based dashboard.
     */
    test('should return JWT token for any valid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 20 }),
            role: fc.constantFrom('student', 'admin', 'seating_manager', 'club_coordinator'),
            firstName: fc.string({ minLength: 2, maxLength: 20 }),
            lastName: fc.string({ minLength: 2, maxLength: 20 })
          }),
          async (userData) => {
            // Setup: Create user in database
            const hashedPassword = await authService.hashPassword(userData.password);
            const [result] = await db.query(
              `INSERT INTO users (email, password_hash, role, first_name, last_name, is_active) 
               VALUES (?, ?, ?, ?, ?, true)`,
              [userData.email, hashedPassword, userData.role, userData.firstName, userData.lastName]
            );
            const userId = result.insertId;

            try {
              // Test: Login with valid credentials
              const loginResult = await authService.login(userData.email, userData.password);

              // Assertions
              expect(loginResult).toHaveProperty('token');
              expect(loginResult).toHaveProperty('user');
              expect(loginResult.user.email).toBe(userData.email);
              expect(loginResult.user.role).toBe(userData.role);
              expect(loginResult.user).not.toHaveProperty('password_hash');
              expect(typeof loginResult.token).toBe('string');
              expect(loginResult.token.length).toBeGreaterThan(0);
            } finally {
              // Cleanup
              await db.query('DELETE FROM users WHERE id = ?', [userId]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Invalid credentials are rejected', () => {
    /**
     * Feature: academic-exam-management-system, Property 2: Invalid credentials are rejected
     * Validates: Requirements 1.2
     * 
     * For any invalid credentials (non-existent email, incorrect password, or malformed input),
     * the login attempt should be rejected with an appropriate error message and no token should be issued.
     */
    test('should reject login for any non-existent email', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 20 })
          }),
          async (credentials) => {
            // Ensure email doesn't exist
            const [users] = await db.query('SELECT id FROM users WHERE email = ?', [credentials.email]);
            if (users.length > 0) {
              return; // Skip this test case if email exists
            }

            // Test: Attempt login with non-existent email
            await expect(
              authService.login(credentials.email, credentials.password)
            ).rejects.toThrow('Invalid credentials');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject login for any incorrect password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            correctPassword: fc.string({ minLength: 8, maxLength: 20 }),
            wrongPassword: fc.string({ minLength: 8, maxLength: 20 }),
            role: fc.constantFrom('student', 'admin', 'seating_manager', 'club_coordinator'),
            firstName: fc.string({ minLength: 2, maxLength: 20 }),
            lastName: fc.string({ minLength: 2, maxLength: 20 })
          }),
          async (userData) => {
            // Skip if passwords are the same
            if (userData.correctPassword === userData.wrongPassword) {
              return;
            }

            // Setup: Create user with correct password
            const hashedPassword = await authService.hashPassword(userData.correctPassword);
            const [result] = await db.query(
              `INSERT INTO users (email, password_hash, role, first_name, last_name, is_active) 
               VALUES (?, ?, ?, ?, ?, true)`,
              [userData.email, hashedPassword, userData.role, userData.firstName, userData.lastName]
            );
            const userId = result.insertId;

            try {
              // Test: Attempt login with wrong password
              await expect(
                authService.login(userData.email, userData.wrongPassword)
              ).rejects.toThrow('Invalid credentials');
            } finally {
              // Cleanup
              await db.query('DELETE FROM users WHERE id = ?', [userId]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Passwords are encrypted before storage', () => {
    /**
     * Feature: academic-exam-management-system, Property 4: Passwords are encrypted before storage
     * Validates: Requirements 1.4
     * 
     * For any password submitted during user registration or password change,
     * the value stored in the database should be a bcrypt hash, not the plaintext password.
     */
    test('should never store plaintext passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 20 }),
          async (password) => {
            // Test: Hash password
            const hashedPassword = await authService.hashPassword(password);

            // Assertions
            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword.length).toBeGreaterThan(password.length);
            expect(hashedPassword).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt hash format
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should produce different hashes for the same password (salt)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 20 }),
          async (password) => {
            // Test: Hash same password twice
            const hash1 = await authService.hashPassword(password);
            const hash2 = await authService.hashPassword(password);

            // Assertions: Different hashes due to different salts
            expect(hash1).not.toBe(hash2);
            
            // But both should verify correctly
            const verify1 = await authService.comparePassword(password, hash1);
            const verify2 = await authService.comparePassword(password, hash2);
            expect(verify1).toBe(true);
            expect(verify2).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: JWT tokens have correct expiration', () => {
    /**
     * Feature: academic-exam-management-system, Property 5: JWT tokens have correct expiration
     * Validates: Requirements 1.5
     * 
     * For any successfully generated JWT token, the expiration time should be set to
     * 24 hours from the time of creation.
     */
    test('should set token expiration to 24 hours', async () => {
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
            // Test: Generate token
            const beforeTime = Math.floor(Date.now() / 1000);
            const token = authService.generateToken(user);
            const afterTime = Math.floor(Date.now() / 1000);

            // Verify token and check expiration
            const decoded = authService.verifyToken(token);
            
            // Assertions
            expect(decoded).toHaveProperty('exp');
            expect(decoded).toHaveProperty('iat');
            
            // Token should expire in approximately 24 hours (86400 seconds)
            const expectedExpiration = 24 * 60 * 60; // 24 hours in seconds
            const actualExpiration = decoded.exp - decoded.iat;
            
            // Allow 1 second tolerance for processing time
            expect(actualExpiration).toBeGreaterThanOrEqual(expectedExpiration - 1);
            expect(actualExpiration).toBeLessThanOrEqual(expectedExpiration + 1);
            
            // Verify issued at time is correct
            expect(decoded.iat).toBeGreaterThanOrEqual(beforeTime);
            expect(decoded.iat).toBeLessThanOrEqual(afterTime);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
