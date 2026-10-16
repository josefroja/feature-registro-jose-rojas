import type { RegistrationData, RegistrationResult } from '@/domain/registration';
import { validateRegistration } from '@/domain/registrationValidation';
import { normalizeEmail } from '@/domain/validation';
import type { RegistrationGateway } from './ports/RegistrationGateway';

export type Register = (data: RegistrationData) => Promise<RegistrationResult>;

/** Caso de uso: valida el registro y, si procede, delega en el puerto de registro. */
export function createRegister(gateway: RegistrationGateway): Register {
  return async (data) => {
    const errors = validateRegistration(data);
    if (Object.keys(errors).length > 0) return { kind: 'invalid', errors };
    try {
      return await gateway.register({
        fullName: data.fullName.trim(),
        email: normalizeEmail(data.email),
        password: data.password,
      });
    } catch {
      return { kind: 'unavailable' };
    }
  };
}
