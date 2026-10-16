import { MESSAGES } from './messages';
import type { RegistrationData, RegistrationErrors } from './registration';
import {
  isValidEmail,
  normalizeEmail,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from './validation';

export const FULL_NAME_MAX_LENGTH = 100;

function validateFullName(fullName: string): string | undefined {
  const trimmed = fullName.trim();
  if (trimmed === '') return MESSAGES.NAME_REQUIRED;
  if (trimmed.length > FULL_NAME_MAX_LENGTH) return MESSAGES.NAME_TOO_LONG;
  return undefined;
}

function validateEmail(email: string): string | undefined {
  if (normalizeEmail(email) === '') return MESSAGES.EMAIL_REQUIRED;
  if (!isValidEmail(email)) return MESSAGES.EMAIL_INVALID;
  return undefined;
}

function validatePassword(password: string): string | undefined {
  // La contraseña se valida sin recortar (FR-006).
  if (password === '') return MESSAGES.PASSWORD_REQUIRED;
  if (password.length < PASSWORD_MIN_LENGTH) return MESSAGES.PASSWORD_TOO_SHORT;
  if (password.length > PASSWORD_MAX_LENGTH) return MESSAGES.PASSWORD_TOO_LONG;
  return undefined;
}

function validateConfirmation(
  password: string,
  confirmPassword: string,
  passwordIsValid: boolean,
): string | undefined {
  if (confirmPassword === '') return MESSAGES.CONFIRM_REQUIRED;
  // Con una contraseña inválida no se informa también la falta de coincidencia.
  if (passwordIsValid && confirmPassword !== password) return MESSAGES.PASSWORD_MISMATCH;
  return undefined;
}

/** Reglas FR-003 a FR-007. Devuelve {} si el formulario es válido. */
export function validateRegistration(data: RegistrationData): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const fullName = validateFullName(data.fullName);
  const email = validateEmail(data.email);
  const password = validatePassword(data.password);
  const confirmPassword = validateConfirmation(
    data.password,
    data.confirmPassword,
    password === undefined,
  );
  if (fullName) errors.fullName = fullName;
  if (email) errors.email = email;
  if (password) errors.password = password;
  if (confirmPassword) errors.confirmPassword = confirmPassword;
  if (!data.acceptedTerms) errors.acceptedTerms = MESSAGES.TERMS_REQUIRED;
  return errors;
}
