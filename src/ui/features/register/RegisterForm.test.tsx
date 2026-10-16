import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithNavigation } from '@/test/renderWithNavigation';
import { createRegisterStub } from '@/test/registerStub';
import { RegisterForm } from './RegisterForm';

const VALID = {
  fullName: 'Ana Pérez',
  email: 'ana@example.test',
  password: 'clave-segura-1',
};

function setup(stub = createRegisterStub()) {
  const user = userEvent.setup();
  const onRegistered = vi.fn();
  const view = renderWithNavigation(
    <RegisterForm register={stub.register} onRegistered={onRegistered} />,
    '/registro',
  );
  const fullName = screen.getByLabelText('Nombre completo');
  const email = screen.getByLabelText('Correo electrónico');
  const password = screen.getByLabelText('Contraseña');
  const confirm = screen.getByLabelText('Confirmar contraseña');
  const terms = screen.getByRole('checkbox');
  const submit = () => user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  const fillValid = async () => {
    await user.type(fullName, VALID.fullName);
    await user.type(email, VALID.email);
    await user.type(password, VALID.password);
    await user.type(confirm, VALID.password);
    await user.click(terms);
  };
  return {
    user,
    stub,
    onRegistered,
    view,
    fullName,
    email,
    password,
    confirm,
    terms,
    submit,
    fillValid,
  };
}

describe('RegisterForm · US1 Crear una cuenta con datos válidos', () => {
  it('estructura: título, subtítulo y los cuatro campos del frame 04', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByText('Completa tus datos para comenzar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Diego Martínez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tucorreo@ejemplo.com')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    expect(screen.getByText('o regístrate con')).toBeInTheDocument();
  });

  it('US1-1: datos válidos y términos marcados → llama a register una vez con los cinco campos', async () => {
    const { stub, fillValid, submit } = setup();
    await fillValid();
    await submit();
    expect(stub.register).toHaveBeenCalledExactlyOnceWith({
      ...VALID,
      confirmPassword: VALID.password,
      acceptedTerms: true,
    });
  });

  it('US1-1: con éxito se invoca onRegistered una sola vez', async () => {
    const { onRegistered, fillValid, submit } = setup();
    await fillValid();
    await submit();
    await vi.waitFor(() => expect(onRegistered).toHaveBeenCalledOnce());
  });

  it('US1-3: durante la espera el botón está ocupado y no admite reenvíos', async () => {
    const stub = createRegisterStub();
    stub.defer();
    const { user, fillValid, submit } = setup(stub);
    await fillValid();
    await submit();
    const busy = screen.getByRole('button', { name: 'Creando cuenta…' });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
    await user.click(busy);
    await user.keyboard('{Enter}');
    expect(stub.register).toHaveBeenCalledOnce();
  });

  it('US1-4: Enter en un campo de texto envía el formulario válido', async () => {
    const { stub, user, fillValid, confirm } = setup();
    await fillValid();
    await user.click(confirm);
    await user.keyboard('{Enter}');
    expect(stub.register).toHaveBeenCalledOnce();
  });

  it('FR-013/T-UI-08: un fallo muestra el error, conserva nombre y correo y vacía las contraseñas', async () => {
    const { onRegistered, fillValid, submit, fullName, email, password, confirm } = setup(
      createRegisterStub({ kind: 'unavailable' }),
    );
    await fillValid();
    await submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos crear tu cuenta. Intenta más tarde.',
    );
    expect(fullName).toHaveValue(VALID.fullName);
    expect(email).toHaveValue(VALID.email);
    expect(password).toHaveValue('');
    expect(confirm).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
    expect(onRegistered).not.toHaveBeenCalled();
  });

  it('FR-013: editar un campo tras un fallo oculta el mensaje global', async () => {
    const { user, fillValid, submit, password } = setup(
      createRegisterStub({ kind: 'unavailable' }),
    );
    await fillValid();
    await submit();
    await screen.findByRole('alert');
    await user.type(password, 'x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('si se desmonta antes de resolver no actualiza el estado ni invoca onRegistered', async () => {
    const stub = createRegisterStub();
    stub.defer();
    const { fillValid, submit, view, onRegistered } = setup(stub);
    await fillValid();
    await submit();
    view.unmount();
    stub.release();
    await Promise.resolve();
    expect(onRegistered).not.toHaveBeenCalled();
  });
});

describe('RegisterForm · US2 validar todos los campos antes de enviar', () => {
  it('US2-1/T-UI-02: formulario vacío muestra los cinco mensajes, no registra y enfoca el nombre', async () => {
    const { stub, submit, fullName } = setup();
    await submit();
    expect(screen.getByText('Ingresa tu nombre completo')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu correo electrónico')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument();
    expect(screen.getByText('Confirma tu contraseña')).toBeInTheDocument();
    expect(screen.getByText('Debes aceptar los términos y condiciones')).toBeInTheDocument();
    expect(stub.register).not.toHaveBeenCalled();
    expect(fullName).toHaveFocus();
  });

  it('US2-1: con el nombre válido y el resto vacío el foco va al correo', async () => {
    const { user, fullName, email, submit } = setup();
    await user.type(fullName, 'Ana');
    await submit();
    expect(email).toHaveFocus();
  });

  it('US2-1: con todo válido salvo los términos el foco va a la casilla', async () => {
    const { user, fillValid, terms, submit } = setup();
    await fillValid();
    await user.click(terms);
    await submit();
    expect(screen.getByText('Debes aceptar los términos y condiciones')).toBeInTheDocument();
    expect(terms).toHaveFocus();
  });

  it('US2-1: con nombre, correo y contraseña válidos y la confirmación vacía el foco va a la confirmación', async () => {
    const { user, fullName, email, password, confirm, submit } = setup();
    await user.type(fullName, 'Ana');
    await user.type(email, 'ana@example.test');
    await user.type(password, 'clave-segura-1');
    await submit();
    expect(confirm).toHaveFocus();
  });

  it('FR-011: un segundo envío con Enter mientras hay uno en curso se ignora', async () => {
    const stub = createRegisterStub();
    stub.defer();
    const { user, fillValid, confirm } = setup(stub);
    await fillValid();
    await user.click(confirm);
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    expect(stub.register).toHaveBeenCalledOnce();
  });

  it('US2-5: sin aceptar los términos no se registra', async () => {
    const { stub, user, fillValid, terms, submit } = setup();
    await fillValid();
    await user.click(terms);
    await submit();
    expect(stub.register).not.toHaveBeenCalled();
  });

  it('US2-4: nombre de 101 caracteres → «El nombre no puede superar 100 caracteres»', async () => {
    const { user, fullName } = setup();
    await user.click(fullName);
    await user.paste('a'.repeat(101));
    await user.tab();
    expect(screen.getByText('El nombre no puede superar 100 caracteres')).toBeInTheDocument();
  });

  it('US2-3: un nombre de solo espacios se trata como vacío', async () => {
    const { user, fullName, submit } = setup();
    await user.type(fullName, '   ');
    await submit();
    expect(screen.getByText('Ingresa tu nombre completo')).toBeInTheDocument();
  });

  it('US2-6: cada campo con error expone aria-invalid y aria-describedby hacia su mensaje', async () => {
    const { submit, fullName, email, password, confirm, terms } = setup();
    await submit();
    const expected: [HTMLElement, string][] = [
      [fullName, 'Ingresa tu nombre completo'],
      [email, 'Ingresa tu correo electrónico'],
      [password, 'Ingresa tu contraseña'],
      [confirm, 'Confirma tu contraseña'],
      [terms, 'Debes aceptar los términos y condiciones'],
    ];
    for (const [field, message] of expected) {
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field).toHaveAccessibleDescription(message);
    }
  });

  it('US2-2: corregir un campo hace desaparecer su mensaje', async () => {
    const { user, submit, fullName } = setup();
    await submit();
    await user.type(fullName, 'Ana');
    expect(screen.queryByText('Ingresa tu nombre completo')).not.toBeInTheDocument();
    expect(screen.getByText('Ingresa tu correo electrónico')).toBeInTheDocument();
  });

  it('edge: términos marcados con el resto vacío solo muestra los errores de campos vacíos', async () => {
    const { user, terms, submit } = setup();
    await user.click(terms);
    await submit();
    expect(screen.queryByText('Debes aceptar los términos y condiciones')).not.toBeInTheDocument();
    expect(screen.getByText('Ingresa tu nombre completo')).toBeInTheDocument();
  });
});

describe('RegisterForm · US3 validación inline del correo', () => {
  it.each(['usuario@', 'usuario.com', 'a@b'])(
    'US3-1: «%s» muestra el error de formato al salir del campo, sin enviar',
    async (value) => {
      const { stub, user, email } = setup();
      await user.type(email, value);
      expect(screen.queryByText('Ingresa un correo electrónico válido')).not.toBeInTheDocument();
      await user.tab();
      expect(screen.getByText('Ingresa un correo electrónico válido')).toBeInTheDocument();
      expect(stub.register).not.toHaveBeenCalled();
    },
  );

  it('US3-2: corregirlo hace desaparecer el mensaje mientras se escribe', async () => {
    const { user, email } = setup();
    await user.type(email, 'usuario@');
    await user.tab();
    await user.click(email);
    await user.type(email, 'example.test');
    expect(screen.queryByText('Ingresa un correo electrónico válido')).not.toBeInTheDocument();
  });

  it('US3-3: mayúsculas y espacios periféricos se aceptan y se normaliza el correo', async () => {
    const stub = createRegisterStub();
    const { user, email, fillValid, submit } = setup(stub);
    await fillValid();
    await user.clear(email);
    await user.type(email, '  Ana@Example.TEST  ');
    await user.tab();
    expect(screen.queryByText('Ingresa un correo electrónico válido')).not.toBeInTheDocument();
    await submit();
    expect(stub.register).toHaveBeenCalledOnce();
  });

  it('US3-4: un correo de 255 caracteres es inválido', async () => {
    const { user, email } = setup();
    await user.click(email);
    await user.paste(`${'a'.repeat(255 - '@example.test'.length)}@example.test`);
    await user.tab();
    expect(screen.getByText('Ingresa un correo electrónico válido')).toBeInTheDocument();
  });

  it('US3-5: salir del campo vacío muestra el mensaje de campo obligatorio', async () => {
    const { user, email } = setup();
    await user.click(email);
    await user.tab();
    expect(screen.getByText('Ingresa tu correo electrónico')).toBeInTheDocument();
  });

  it('el pegado de texto se valida igual que el escrito', async () => {
    const { user, email } = setup();
    await user.click(email);
    await user.paste('usuario@');
    await user.tab();
    expect(screen.getByText('Ingresa un correo electrónico válido')).toBeInTheDocument();
  });
});

describe('RegisterForm · US4 contraseña segura y coincidente', () => {
  it('US4-1/T-UI-04: 7 caracteres al salir del campo → contraseña corta y no se registra', async () => {
    const { stub, user, fillValid, password, submit } = setup();
    await fillValid();
    await user.clear(password);
    await user.type(password, 'a'.repeat(7));
    await user.tab();
    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument();
    await submit();
    expect(stub.register).not.toHaveBeenCalled();
  });

  it('US4-3: «Las contraseñas no coinciden» se asocia a la confirmación', async () => {
    const { user, password, confirm } = setup();
    await user.type(password, 'clave-segura-1');
    await user.type(confirm, 'otra-clave-123');
    await user.tab();
    expect(confirm).toHaveAccessibleDescription('Las contraseñas no coinciden');
  });

  it('US4-4: igualar las contraseñas oculta el mensaje, también al corregir solo el primer campo', async () => {
    const { user, password, confirm } = setup();
    await user.type(password, 'clave-segura-1');
    await user.type(confirm, 'otra-clave-123');
    await user.tab();
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    await user.clear(password);
    await user.type(password, 'otra-clave-123');
    expect(screen.queryByText('Las contraseñas no coinciden')).not.toBeInTheDocument();
  });

  it('edge: completar la confirmación antes que la contraseña reevalúa al escribir la contraseña', async () => {
    const { user, password, confirm } = setup();
    await user.type(confirm, 'clave-segura-1');
    await user.tab();
    await user.type(password, 'clave-segura-1');
    expect(screen.queryByText('Las contraseñas no coinciden')).not.toBeInTheDocument();
  });

  it('US4-6/T-UI-05: la visibilidad de cada contraseña es independiente', async () => {
    const { user, password, confirm } = setup();
    const toggles = screen.getAllByRole('button', { name: 'Mostrar contraseña' });
    expect(toggles).toHaveLength(2);
    await user.click(toggles[0] as HTMLElement);
    expect(password).toHaveAttribute('type', 'text');
    expect(confirm).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Mostrar contraseña' })).toHaveLength(1);
  });
});

describe('RegisterForm · US5 ir a iniciar sesión', () => {
  it('US5-1: el pie contiene el enlace «Inicia sesión» hacia /login', () => {
    setup();
    expect(screen.getByRole('link', { name: 'Inicia sesión' })).toHaveAttribute('href', '/login');
    expect(screen.getByText('¿Ya tienes cuenta?')).toBeInTheDocument();
  });

  it('US5-1: activar el enlace navega a /login', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('link', { name: 'Inicia sesión' }));
    expect(window.location.pathname).toBe('/login');
  });

  it('US5-2: los datos escritos no se conservan al volver a la pantalla', async () => {
    const { user, fullName, view } = setup();
    await user.type(fullName, 'Ana');
    await user.click(screen.getByRole('link', { name: 'Inicia sesión' }));
    view.unmount();
    setup();
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
  });
});

describe('RegisterForm · US6 Google, Apple y términos no disponibles', () => {
  it.each(['Google', 'Apple'])(
    'US6-1/2: «%s» muestra «Próximamente» sin registrar ni modificar los datos',
    async (provider) => {
      const { stub, user, fullName } = setup();
      await user.type(fullName, 'Ana');
      await user.click(screen.getByRole('button', { name: provider }));
      expect(screen.getByRole('status')).toHaveTextContent('Próximamente');
      expect(fullName).toHaveValue('Ana');
      expect(stub.register).not.toHaveBeenCalled();
      expect(window.location.pathname).toBe('/registro');
    },
  );

  it('US6-3/T-UI-07: Google y luego Apple dejan un único aviso', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Google' }));
    await user.click(screen.getByRole('button', { name: 'Apple' }));
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Próximamente');
  });

  it('FR-015: el botón «términos y condiciones» muestra el aviso y no cambia la casilla', async () => {
    const { user, terms } = setup();
    await user.click(screen.getByRole('button', { name: 'términos y condiciones' }));
    expect(screen.getByRole('status')).toHaveTextContent('Próximamente');
    expect(terms).not.toBeChecked();
    expect(terms).toHaveAccessibleName('Acepto los términos y condiciones');
  });

  it('el aviso se limpia al enviar un formulario válido', async () => {
    const { user, fillValid, submit } = setup();
    await user.click(screen.getByRole('button', { name: 'Google' }));
    await fillValid();
    await submit();
    expect(screen.queryByText('Próximamente')).not.toBeInTheDocument();
  });
});
