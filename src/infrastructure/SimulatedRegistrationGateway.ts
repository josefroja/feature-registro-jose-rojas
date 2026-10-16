import type { RegistrationGateway } from '@/application/ports/RegistrationGateway';
import type { RegistrationResult } from '@/domain/registration';

/**
 * SIMULACIÓN: no existe un backend de registro. Esta implementación espera un momento y siempre
 * devuelve éxito; descarta los datos recibidos (no los envía, guarda ni registra). La cuenta
 * «creada» no queda disponible para iniciar sesión. Un adaptador real debe implementar
 * `RegistrationGateway` y reemplazar a este en `src/main.tsx`
 * (specs/002-registro-usuario/contracts/registration-gateway.md).
 */
export class SimulatedRegistrationGateway implements RegistrationGateway {
  private readonly delayMs: number;

  constructor(options: { delayMs?: number } = {}) {
    this.delayMs = options.delayMs ?? 1000;
  }

  register(): Promise<RegistrationResult> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ kind: 'success' }), this.delayMs);
    });
  }
}
