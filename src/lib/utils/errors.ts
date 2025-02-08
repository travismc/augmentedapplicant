export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUserData(userId: string, email: string, fullName?: string) {
  if (!userId?.trim()) {
    throw new ValidationError('User ID is required');
  }

  if (!email?.trim()) {
    throw new ValidationError('Email is required', 'email');
  }

  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }

  if (fullName && fullName.length > 100) {
    throw new ValidationError('Full name is too long (max 100 characters)', 'fullName');
  }
}
