import type { RegistrationData, RegistrationResult } from '@/domain/registration';
import { createRegister } from './register';
import type { RegistrationGateway } from './ports/RegistrationGateway';

const data: RegistrationData = {
  fullName: '  Ana Pérez ',
  email: '  Ana@Example.TEST ',
  password: 'clave-segura-1 ',
  confirmPassword: 'clave-segura-1 ',
  acceptedTerms: true,
};

function createGateway(result: RegistrationResult = { kind: 'success' }) {
  const register = vi.fn<RegistrationGateway['register']>(() => Promise.resolve(result));
  return { gateway: { register } satisfies RegistrationGateway, register };
}

describe('createRegister', () => {
  it('U1/SC-004: con datos inválidos devuelve invalid y no llama al puerto', async () => {
    const { gateway, register } = createGateway();
    const result = await createRegister(gateway)({ ...data, email: 'usuario@' });
    expect(result).toEqual({
      kind: 'invalid',
      errors: { email: 'Ingresa un correo electrónico válido' },
    });
    expect(register).not.toHaveBeenCalled();
  });

  it('U1/FR-003: sin aceptar términos no llama al puerto', async () => {
    const { gateway, register } = createGateway();
    const result = await createRegister(gateway)({ ...data, acceptedTerms: false });
    expect(result.kind).toBe('invalid');
    expect(register).not.toHaveBeenCalled();
  });

  it('U2/FR-011: con datos válidos envía nombre recortado, correo normalizado y contraseña intacta', async () => {
    const { gateway, register } = createGateway();
    const result = await createRegister(gateway)(data);
    expect(result).toEqual({ kind: 'success' });
    expect(register).toHaveBeenCalledExactlyOnceWith({
      fullName: 'Ana Pérez',
      email: 'ana@example.test',
      password: 'clave-segura-1 ',
    });
  });

  it('FR-013: propaga unavailable del puerto', async () => {
    const { gateway } = createGateway({ kind: 'unavailable' });
    expect(await createRegister(gateway)(data)).toEqual({ kind: 'unavailable' });
  });

  it('U3/FR-013: si el puerto lanza una excepción devuelve unavailable sin rechazar', async () => {
    const gateway: RegistrationGateway = {
      register: () => Promise.reject(new Error('fallo interno')),
    };
    await expect(createRegister(gateway)(data)).resolves.toEqual({ kind: 'unavailable' });
  });
});
