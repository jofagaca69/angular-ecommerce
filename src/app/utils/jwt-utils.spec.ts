import { decodeJWT, getRoleFromToken, isTokenExpired, isAdminOrEmployee, JWTPayload } from './jwt-utils';

describe('JWT Utils', () => {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1NiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDYzMTM2MDAsImV4cCI6MTcwNjM5OTYwMH0.signature';

  describe('decodeJWT', () => {
    it('ADMIN-JWT-UTILS-001: should decode valid JWT token', () => {
      const payload = decodeJWT(mockToken);
      
      expect(payload).not.toBeNull();
      expect(payload?.id).toBe('123456');
      expect(payload?.username).toBe('admin');
      expect(payload?.role).toBe('admin');
    });

    it('ADMIN-JWT-UTILS-002: should return null for invalid token format', () => {
      const invalidToken = 'invalid.token';
      const payload = decodeJWT(invalidToken);
      
      expect(payload).toBeNull();
    });

    it('ADMIN-JWT-UTILS-003: should return null for empty token', () => {
      const payload = decodeJWT('');
      expect(payload).toBeNull();
    });

    it('ADMIN-JWT-UTILS-004: should return null for null/undefined token', () => {
      expect(decodeJWT(null as any)).toBeNull();
      expect(decodeJWT(undefined as any)).toBeNull();
    });
  });

  describe('getRoleFromToken', () => {
    it('ADMIN-JWT-UTILS-005: should extract role from valid token', () => {
      const role = getRoleFromToken(mockToken);
      expect(role).toBe('admin');
    });

    it('ADMIN-JWT-UTILS-006: should return null for token without role', () => {
      const tokenWithoutRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1NiIsInVzZXJuYW1lIjoiYWRtaW4ifQ.signature';
      const role = getRoleFromToken(tokenWithoutRole);
      expect(role).toBeNull();
    });

    it('ADMIN-JWT-UTILS-007: should return null for invalid token', () => {
      const role = getRoleFromToken('invalid');
      expect(role).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('ADMIN-JWT-UTILS-008: should return false for non-expired token', () => {
      // Token with exp in the future (year 2024)
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = createMockToken({ exp: futureExp });
      
      expect(isTokenExpired(token)).toBe(false);
    });

    it('ADMIN-JWT-UTILS-009: should return true for expired token', () => {
      // Token with exp in the past
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createMockToken({ exp: pastExp });
      
      expect(isTokenExpired(token)).toBe(true);
    });

    it('ADMIN-JWT-UTILS-010: should return true for token without exp claim', () => {
      const token = createMockToken({});
      expect(isTokenExpired(token)).toBe(true);
    });
  });

  describe('isAdminOrEmployee', () => {
    it('ADMIN-JWT-UTILS-011: should return true for admin role', () => {
      const token = createMockToken({ role: 'admin' });
      expect(isAdminOrEmployee(token)).toBe(true);
    });

    it('ADMIN-JWT-UTILS-012: should return true for employee role', () => {
      const token = createMockToken({ role: 'employee' });
      expect(isAdminOrEmployee(token)).toBe(true);
    });

    it('ADMIN-JWT-UTILS-013: should return false for user role', () => {
      const token = createMockToken({ role: 'user' });
      expect(isAdminOrEmployee(token)).toBe(false);
    });

    it('ADMIN-JWT-UTILS-014: should return false for token without role', () => {
      const token = createMockToken({});
      expect(isAdminOrEmployee(token)).toBe(false);
    });
  });

  // Helper function to create mock JWT tokens
  function createMockToken(payload: Partial<JWTPayload>): string {
    const defaultPayload: JWTPayload = {
      id: '123',
      username: 'test',
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    const fullPayload = { ...defaultPayload, ...payload };
    const encodedPayload = btoa(JSON.stringify(fullPayload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return `header.${encodedPayload}.signature`;
  }
});
