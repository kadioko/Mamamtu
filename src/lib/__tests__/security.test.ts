import {
  validatePassword,
  validateEmail,
  sanitizeInput,
  generateSecureToken,
  hashToken,
  hashPassword,
  verifyPassword,
  comparePasswords,
} from '@/lib/security';

describe('sanitizeInput', () => {
  it('escapes HTML special characters and trims whitespace', () => {
    const input = "  <script>alert('x') & more</script>  ";
    const result = sanitizeInput(input);
    expect(result).toBe("&lt;script&gt;alert(&#39;x&#39;) &amp; more&lt;/script&gt;");
  });

  it('truncates input longer than maxLength', () => {
    const input = 'a'.repeat(2000);
    const result = sanitizeInput(input, 100);
    expect(result.length).toBe(100);
  });
});

describe('validateEmail', () => {
  it('rejects empty email', () => {
    const { valid, error } = validateEmail('');
    expect(valid).toBe(false);
    expect(error).toBe('Email is required');
  });

  it('accepts a valid email', () => {
    const { valid, error } = validateEmail('user@example.com');
    expect(valid).toBe(true);
    expect(error).toBeUndefined();
  });

  it('rejects clearly invalid email', () => {
    const { valid } = validateEmail('invalid-email');
    expect(valid).toBe(false);
  });

  it('rejects suspicious patterns like multiple dots', () => {
    const { valid } = validateEmail('user..name@example.com');
    expect(valid).toBe(false);
  });
});

describe('validatePassword', () => {
  it('rejects password that is too short', () => {
    const result = validatePassword('Ab1');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('at least'))).toBe(true);
  });

  it('rejects password without required character types', () => {
    const noUpper = validatePassword('lowercase123');
    const noNumber = validatePassword('NoNumberHere');

    expect(noUpper.valid).toBe(false);
    expect(noUpper.errors.some((e) => e.toLowerCase().includes('uppercase'))).toBe(true);

    expect(noNumber.valid).toBe(false);
    expect(noNumber.errors.some((e) => e.toLowerCase().includes('number'))).toBe(true);
  });

  it('rejects common passwords', () => {
    const result = validatePassword('Password123');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('too common'))).toBe(true);
  });

  it('rejects passwords with too many consecutive characters', () => {
    const result = validatePassword('AAAA1234a1');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('consecutive'))).toBe(true);
  });

  it('accepts a strong password', () => {
    const result = validatePassword('H3althyMom#2024');
    expect(result.valid).toBe(true);
    expect(result.strength).toBe('strong');
    expect(result.score).toBeGreaterThanOrEqual(80);
  });
});

describe('token helpers', () => {
  it('generateSecureToken returns a hex string of expected length', () => {
    const token = generateSecureToken();
    // default length is 32 bytes => 64 hex chars
    expect(token).toMatch(/^[0-9a-f]+$/i);
    expect(token.length).toBe(64);
  });

  it('hashToken is deterministic and length 64', () => {
    const token = 'test-token';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/i);
  });
});

describe('password hashing and comparison', () => {
  it('hashPassword and verifyPassword work for correct password', async () => {
    const password = 'ValidPass123';
    const hash = await hashPassword(password);

    const ok = await verifyPassword(password, hash);
    const bad = await verifyPassword('WrongPass123', hash);

    expect(ok).toBe(true);
    expect(bad).toBe(false);
  });

  it('comparePasswords delegates to verifyPassword semantics', async () => {
    const password = 'AnotherValid123';
    const hash = await hashPassword(password);

    const ok = await comparePasswords(hash, password);
    const bad = await comparePasswords(hash, 'NotThePassword');

    expect(ok).toBe(true);
    expect(bad).toBe(false);
  });
});
