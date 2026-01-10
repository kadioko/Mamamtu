import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import {
  validatePassword,
  hashPassword,
  validateEmail,
  sanitizeInput,
  generateSecureToken,
  hashToken,
  ACCOUNT_LOCKOUT_CONFIG
} from '@/lib/security';
import { checkRateLimit, getClientIdentifier, generalRateLimiter } from '@/lib/rateLimiter';

export async function POST(req: Request) {
  try {
    // Rate limiting for registration
    const clientId = getClientIdentifier(req);
    const rateLimitCheck = checkRateLimit(
      generalRateLimiter,
      `${clientId}:register`,
      req
    );

    if (rateLimitCheck.limited) {
      return rateLimitCheck.response!;
    }

    const { name, email, password } = await req.json();

    // Sanitize and validate input
    const sanitizedName = sanitizeInput(name, 100);
    const sanitizedEmail = sanitizeInput(email, 255);

    if (!sanitizedName || !sanitizedEmail || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { message: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findFirst({
      where: {
        email: sanitizedEmail.toLowerCase()
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = generateSecureToken();
    const verificationTokenHash = hashToken(verificationToken);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with verification token
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(), // Store email in lowercase
        hashedPassword,
        role: 'PATIENT', // Default role
        emailVerificationToken: verificationTokenHash,
        emailVerificationExpires: verificationExpires,
        isActive: false, // User needs to verify email first
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Continue even if email sending fails
    }

    // Return user data without sensitive info
    const { hashedPassword: _, emailVerificationToken: __, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        user: userWithoutPassword, 
        message: 'Registration successful! Please check your email to verify your account.' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
