/**
 * JWT Utility Functions
 * 
 * These utilities decode JWT tokens without verification (read-only).
 * Token verification should always be done on the backend.
 */

export interface JWTPayload {
  id: string;
  username: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token without verification (read-only operation)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token) {
      return null;
    }

    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64URL decode
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // Parse JSON
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Get user role from JWT token
 * @param token - JWT token string
 * @returns User role or null if token is invalid
 */
export function getRoleFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.role || null;
}

/**
 * Check if token is expired (based on exp claim)
 * @param token - JWT token string
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true; // Consider invalid tokens as expired
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Check if user has admin or employee role
 * @param token - JWT token string
 * @returns true if user has admin or employee role
 */
export function isAdminOrEmployee(token: string): boolean {
  const role = getRoleFromToken(token);
  return role === 'admin' || role === 'employee';
}
