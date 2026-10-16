import { initialRegisterState, registerReducer, type RegisterState } from './registerReducer';

const filled: RegisterState = {
  ...initialRegisterState,
  values: {
    fullName: 'Ana Pérez',
    email: 'ana@example.test',
    password: 'clave-segura-1',
    confirmPassword: 'clave-segura-1',
  },
  acceptedTerms: true,
};

describe('registerReducer · US1', () => {
  it('estado inicial: editing con valores vacíos y términos sin aceptar', () => {
    expect(initialRegisterState.status).toBe('editing');
    expect(initialRegisterState.values).toEqual({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(initialRegisterState.acceptedTerms).toBe(false);
  });

  it('change actualiza el valor del campo', () => {
    const next = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'fullName',
      value: 'Ana',
    });
    expect(next.values.fullName).toBe('Ana');
  });

  it('toggleTerms cambia acceptedTerms', () => {
    const next = registerReducer(initialRegisterState, { type: 'toggleTerms', checked: true });
    expect(next.acceptedTerms).toBe(true);
  });

  it('US1-3: submit válido → submitting', () => {
    expect(registerReducer(filled, { type: 'submit' }).status).toBe('submitting');
  });

  it('FR-011: un segundo submit en submitting se ignora', () => {
    const submitting = registerReducer(filled, { type: 'submit' });
    expect(registerReducer(submitting, { type: 'submit' })).toBe(submitting);
  });

  it('FR-009: submit con errores sigue en editing', () => {
    expect(registerReducer(initialRegisterState, { type: 'submit' }).status).toBe('editing');
  });

  it('FR-013: failed conserva nombre y correo y vacía las contraseñas', () => {
    const submitting = registerReducer(filled, { type: 'submit' });
    const next = registerReducer(submitting, { type: 'failed' });
    expect(next.status).toBe('failed');
    expect(next.values).toEqual({
      fullName: 'Ana Pérez',
      email: 'ana@example.test',
      password: '',
      confirmPassword: '',
    });
  });

  it('FR-013: editar un campo en failed vuelve a editing', () => {
    const failed = registerReducer(registerReducer(filled, { type: 'submit' }), {
      type: 'failed',
    });
    const next = registerReducer(failed, { type: 'change', field: 'password', value: 'x' });
    expect(next.status).toBe('editing');
  });
});

describe('registerReducer · US2 validar todos los campos', () => {
  it('FR-010: submit vacío marca todo, activa submitAttempted y muestra los cinco errores', () => {
    const next = registerReducer(initialRegisterState, { type: 'submit' });
    expect(next.status).toBe('editing');
    expect(next.submitAttempted).toBe(true);
    expect(next.touched).toEqual({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    expect(next.fieldErrors).toEqual({
      fullName: 'Ingresa tu nombre completo',
      email: 'Ingresa tu correo electrónico',
      password: 'Ingresa tu contraseña',
      confirmPassword: 'Confirma tu contraseña',
      acceptedTerms: 'Debes aceptar los términos y condiciones',
    });
  });

  it('US2-2: change en un campo con error lo recalcula y lo oculta si ya es válido', () => {
    const submitted = registerReducer(initialRegisterState, { type: 'submit' });
    const next = registerReducer(submitted, {
      type: 'change',
      field: 'fullName',
      value: 'Ana',
    });
    expect(next.fieldErrors.fullName).toBeUndefined();
    expect(next.fieldErrors.email).toBe('Ingresa tu correo electrónico');
  });

  it('un campo no tocado no muestra error al cambiar', () => {
    const next = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'email',
      value: 'a',
    });
    expect(next.fieldErrors.email).toBeUndefined();
  });

  it('US2-5: el error de términos aparece tras submit y desaparece al marcar la casilla', () => {
    const submitted = registerReducer(initialRegisterState, { type: 'submit' });
    expect(submitted.fieldErrors.acceptedTerms).toBeDefined();
    const next = registerReducer(submitted, { type: 'toggleTerms', checked: true });
    expect(next.fieldErrors.acceptedTerms).toBeUndefined();
  });

  it('el error de términos no aparece antes de intentar enviar', () => {
    const next = registerReducer(initialRegisterState, { type: 'toggleTerms', checked: false });
    expect(next.fieldErrors.acceptedTerms).toBeUndefined();
  });

  it('US2-3: un nombre de solo espacios se trata como vacío', () => {
    const state = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'fullName',
      value: '   ',
    });
    const next = registerReducer(state, { type: 'blur', field: 'fullName' });
    expect(next.fieldErrors.fullName).toBe('Ingresa tu nombre completo');
  });

  it('blur marca el campo como tocado y calcula solo su error', () => {
    const next = registerReducer(initialRegisterState, { type: 'blur', field: 'email' });
    expect(next.touched.email).toBe(true);
    expect(next.fieldErrors).toEqual({ email: 'Ingresa tu correo electrónico' });
  });
});

describe('registerReducer · US3 correo inline y US4 contraseña', () => {
  it('US3-1: blur de email con «usuario@» produce el error de formato sin afectar a otros campos', () => {
    const typed = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'email',
      value: 'usuario@',
    });
    const next = registerReducer(typed, { type: 'blur', field: 'email' });
    expect(next.fieldErrors).toEqual({ email: 'Ingresa un correo electrónico válido' });
  });

  it('US4-1: blur de password con 7 caracteres → contraseña corta', () => {
    const typed = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'password',
      value: 'a'.repeat(7),
    });
    const next = registerReducer(typed, { type: 'blur', field: 'password' });
    expect(next.fieldErrors.password).toBe('La contraseña debe tener al menos 8 caracteres');
  });

  it('US4-2: 129 caracteres → contraseña demasiado larga', () => {
    const typed = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'password',
      value: 'a'.repeat(129),
    });
    const next = registerReducer(typed, { type: 'blur', field: 'password' });
    expect(next.fieldErrors.password).toBe('La contraseña no puede superar 128 caracteres');
  });

  const withConfirmTouched = () => {
    let state: RegisterState = { ...initialRegisterState };
    state = registerReducer(state, { type: 'change', field: 'password', value: 'clave-segura-1' });
    state = registerReducer(state, {
      type: 'change',
      field: 'confirmPassword',
      value: 'otra-clave-123',
    });
    return registerReducer(state, { type: 'blur', field: 'confirmPassword' });
  };

  it('US4-3: contraseña válida y confirmación distinta tocada → no coinciden', () => {
    expect(withConfirmTouched().fieldErrors.confirmPassword).toBe('Las contraseñas no coinciden');
  });

  it('US4-4: cambiar password hasta igualar la confirmación borra el error', () => {
    const next = registerReducer(withConfirmTouched(), {
      type: 'change',
      field: 'password',
      value: 'otra-clave-123',
    });
    expect(next.fieldErrors.confirmPassword).toBeUndefined();
  });

  it('US4-4: cambiar password para diferenciarla de una confirmación tocada crea el error', () => {
    const equal = registerReducer(withConfirmTouched(), {
      type: 'change',
      field: 'password',
      value: 'otra-clave-123',
    });
    const next = registerReducer(equal, {
      type: 'change',
      field: 'password',
      value: 'otra-clave-1234',
    });
    expect(next.fieldErrors.confirmPassword).toBe('Las contraseñas no coinciden');
  });

  it('US4-5: un espacio final cuenta en la comparación', () => {
    const next = registerReducer(withConfirmTouched(), {
      type: 'change',
      field: 'confirmPassword',
      value: 'clave-segura-1 ',
    });
    expect(next.fieldErrors.confirmPassword).toBe('Las contraseñas no coinciden');
  });
});

describe('registerReducer · US6 avisos «Próximamente»', () => {
  it('US6-3: showNotice guarda el mensaje y reemplaza el anterior', () => {
    const first = registerReducer(initialRegisterState, { type: 'showNotice', message: 'A' });
    const second = registerReducer(first, { type: 'showNotice', message: 'B' });
    expect(first.notice).toBe('A');
    expect(second.notice).toBe('B');
  });

  it('submit válido limpia el aviso y change no lo borra', () => {
    const noticed = registerReducer(filled, { type: 'showNotice', message: 'A' });
    expect(registerReducer(noticed, { type: 'change', field: 'fullName', value: 'x' }).notice).toBe(
      'A',
    );
    expect(registerReducer(noticed, { type: 'submit' }).notice).toBeNull();
  });
});
