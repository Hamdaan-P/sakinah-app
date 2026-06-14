/**
 * Password Validator
 * Mirrors Flutter's shared/utils/password_validator.dart
 */

import type { PasswordRequirements, PasswordStrength } from '../types/auth.types';

/**
 * Validates password against security requirements
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string | undefined): string | null {
  if (!password || password.length === 0) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }

  return null; // Password is valid
}

/**
 * Returns password strength from 0 (weak) to 4 (very strong)
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) return 0;

  let strength = 0;

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character variety checks
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  // Cap at 4
  return Math.min(strength, 4) as PasswordStrength;
}

/**
 * Returns color based on password strength
 */
export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 0:
    case 1:
      return '#ef4444'; // red-500
    case 2:
      return '#f97316'; // orange-500
    case 3:
      return '#eab308'; // yellow-500
    case 4:
      return '#22c55e'; // green-500
    default:
      return '#6b7280'; // gray-500
  }
}

/**
 * Returns text description of password strength
 */
export function getStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Unknown';
  }
}

/**
 * Checks individual password requirements
 */
export function checkPasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

/**
 * Gets requirement items for UI display
 */
export function getRequirementItems(password: string): Array<{ text: string; met: boolean }> {
  const requirements = checkPasswordRequirements(password);

  return [
    { text: 'At least 8 characters', met: requirements.minLength },
    { text: 'One uppercase letter', met: requirements.hasUppercase },
    { text: 'One lowercase letter', met: requirements.hasLowercase },
    { text: 'One number', met: requirements.hasNumber },
    // Optional: special character requirement
    // { text: 'One special character', met: requirements.hasSpecial },
  ];
}
