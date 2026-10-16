import type { RegistrationData } from './registration';
import { validateRegistration } from './registrationValidation';

const valid: RegistrationData = {
  fullName: 'Ana Pérez',
  email: 'ana@example.test',
  password: 'clave-segura-1',
  confirmPassword: 'clave-segura-1',
  acceptedTerms: true,
};

const errorsFor = (changes: Partial<RegistrationData>) =>
  validateRegistration({ ...valid, ...changes });

describe('validateRegistration', () => {
  it('FR-009: datos válidos no producen errores', () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it('FR-009: formulario vacío devuelve los cinco errores a la vez', () => {
    expect(
      validateRegistration({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false,
      }),
    ).toEqual({
      fullName: 'Ingresa tu nombre completo',
      email: 'Ingresa tu correo electrónico',
      password: 'Ingresa tu contraseña',
      confirmPassword: 'Confirma tu contraseña',
      acceptedTerms: 'Debes aceptar los términos y condiciones',
    });
  });

  describe('FR-004 nombre', () => {
    it('vacío o solo espacios es obligatorio', () => {
      expect(errorsFor({ fullName: '' }).fullName).toBe('Ingresa tu nombre completo');
      expect(errorsFor({ fullName: '   ' }).fullName).toBe('Ingresa tu nombre completo');
    });

    it('100 caracteres es válido y 101 no', () => {
      expect(errorsFor({ fullName: 'a'.repeat(100) }).fullName).toBeUndefined();
      expect(errorsFor({ fullName: 'a'.repeat(101) }).fullName).toBe(
        'El nombre no puede superar 100 caracteres',
      );
    });

    it('los espacios periféricos no cuentan para el máximo', () => {
      expect(errorsFor({ fullName: ` ${'a'.repeat(100)} ` }).fullName).toBeUndefined();
    });

    it('acepta acentos, ñ, apóstrofes y guiones', () => {
      expect(errorsFor({ fullName: "María José O'Neil-Peña" }).fullName).toBeUndefined();
    });
  });

  describe('FR-005 correo', () => {
    it('vacío es obligatorio', () => {
      expect(errorsFor({ email: '  ' }).email).toBe('Ingresa tu correo electrónico');
    });

    it.each(['usuario@', 'usuario.com', 'a@b'])('%s tiene formato inválido', (email) => {
      expect(errorsFor({ email }).email).toBe('Ingresa un correo electrónico válido');
    });

    it('254 caracteres es válido y 255 no', () => {
      const local = 'a'.repeat(254 - '@example.test'.length);
      expect(errorsFor({ email: `${local}@example.test` }).email).toBeUndefined();
      expect(errorsFor({ email: `${local}a@example.test` }).email).toBe(
        'Ingresa un correo electrónico válido',
      );
    });

    it('acepta mayúsculas y espacios periféricos', () => {
      expect(errorsFor({ email: '  Ana@Example.TEST  ' }).email).toBeUndefined();
    });
  });

  describe('FR-006 contraseña', () => {
    it('vacía es obligatoria', () => {
      expect(errorsFor({ password: '' }).password).toBe('Ingresa tu contraseña');
    });

    it('7 caracteres es corta, 8 y 128 son válidas, 129 es larga', () => {
      expect(errorsFor({ password: 'a'.repeat(7) }).password).toBe(
        'La contraseña debe tener al menos 8 caracteres',
      );
      expect(
        errorsFor({ password: 'a'.repeat(8), confirmPassword: 'a'.repeat(8) }).password,
      ).toBeUndefined();
      expect(
        errorsFor({ password: 'a'.repeat(128), confirmPassword: 'a'.repeat(128) }).password,
      ).toBeUndefined();
      expect(errorsFor({ password: 'a'.repeat(129) }).password).toBe(
        'La contraseña no puede superar 128 caracteres',
      );
    });

    it('los espacios se respetan: ocho espacios es válida', () => {
      expect(
        errorsFor({ password: ' '.repeat(8), confirmPassword: ' '.repeat(8) }).password,
      ).toBeUndefined();
    });
  });

  describe('FR-007 confirmación', () => {
    it('vacía es obligatoria', () => {
      expect(errorsFor({ confirmPassword: '' }).confirmPassword).toBe('Confirma tu contraseña');
    });

    it('distinta no coincide', () => {
      expect(errorsFor({ confirmPassword: 'otra-clave-123' }).confirmPassword).toBe(
        'Las contraseñas no coinciden',
      );
    });

    it('una diferencia de mayúsculas o de un espacio final no coincide', () => {
      expect(errorsFor({ confirmPassword: 'CLAVE-segura-1' }).confirmPassword).toBe(
        'Las contraseñas no coinciden',
      );
      expect(errorsFor({ confirmPassword: 'clave-segura-1 ' }).confirmPassword).toBe(
        'Las contraseñas no coinciden',
      );
    });

    it('no informa no coincidencia si la contraseña es inválida', () => {
      const errors = errorsFor({ password: 'corta', confirmPassword: 'distinta' });
      expect(errors.password).toBe('La contraseña debe tener al menos 8 caracteres');
      expect(errors.confirmPassword).toBeUndefined();
    });
  });

  it('FR-003: términos sin aceptar es un error', () => {
    expect(errorsFor({ acceptedTerms: false }).acceptedTerms).toBe(
      'Debes aceptar los términos y condiciones',
    );
  });
});
