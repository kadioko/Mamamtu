// Password strength validation and security utilities
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
}

// Password strength requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Relaxed for health app user experience
  maxConsecutiveChars: 3,
  preventCommonPasswords: true,
};

/**
 * Validates password strength based on current security requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length checks
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  } else if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must be less than ${PASSWORD_REQUIREMENTS.maxLength} characters long`);
  } else {
    score += 30; // Full length requirement met
  }

  // Character type requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (PASSWORD_REQUIREMENTS.requireUppercase && !hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (PASSWORD_REQUIREMENTS.requireUppercase && hasUppercase) {
    score += 20;
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (PASSWORD_REQUIREMENTS.requireLowercase && hasLowercase) {
    score += 20;
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !hasNumbers) {
    errors.push('Password must contain at least one number');
  } else if (PASSWORD_REQUIREMENTS.requireNumbers && hasNumbers) {
    score += 15;
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !hasSpecialChars) {
    errors.push('Password must contain at least one special character');
  } else if (hasSpecialChars) {
    score += 15; // Bonus points for special characters even if not required
  }

  // Check for excessive consecutive characters
  const consecutiveChars = /(.)\1{3,}/.test(password);
  if (consecutiveChars) {
    errors.push(`Password cannot contain more than ${PASSWORD_REQUIREMENTS.maxConsecutiveChars} consecutive identical characters`);
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '123456', 'qwerty', 'admin', '123456789',
    'abcdef', 'password1', 'welcome', 'admin123', 'root', 'guest',
    'pass', 'letmein', 'test123', 'demo'
  ];

  if (PASSWORD_REQUIREMENTS.preventCommonPasswords &&
      commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common. Please choose a more unique password');
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 80) {
    strength = 'strong';
  } else if (score >= 50) {
    strength = 'medium';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score: Math.max(0, Math.min(100, score)),
  };
}

/**
 * Generates a secure password hash using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Industry standard for 2024
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifies a password against its hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Account lockout configuration
 */
export const ACCOUNT_LOCKOUT_CONFIG = {
  maxAttempts: 5,                // Maximum failed attempts before lockout
  lockoutDuration: 30 * 60 * 1000, // 30 minutes lockout
  resetAfterMs: 24 * 60 * 60 * 1000, // Reset counter after 24 hours
};

/**
 * Generates a secure random token for verification/password reset
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Sanitizes user input by escaping HTML entities and limiting length
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';

  // Truncate if too long
  const truncated = input.length > maxLength ? input.substring(0, maxLength) : input;

  // Basic HTML escaping
  return truncated
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
}

/**
 * Validates email format with additional security checks
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.{2,}/,              // Multiple dots in a row
    /^\.|\.$|\.@|@\+/,     // Starting/ending with dot or plus
    /[<>'"/>]/,            // HTML injection attempts
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(email))) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Compares passwords securely to prevent timing attacks
 */
export async function comparePasswords(storedPass: string, providedPass: string): Promise<boolean> {
  return verifyPassword(providedPass, storedPass);
}

/**
 * Password policy explanation for users
 */
export const getPasswordRequirements = (): string => {
  return `Password must:
• Be at least ${PASSWORD_REQUIREMENTS.minLength} characters long
• Contain at least one uppercase letter and one lowercase letter
• Contain at least one number
${PASSWORD_REQUIREMENTS.requireSpecialChars ? '• Contain at least one special character' : ''}
• Not contain more than ${PASSWORD_REQUIREMENTS.maxConsecutiveChars} consecutive identical characters
• Not be commonly used passwords like 'password123' or '123456'`;
};
