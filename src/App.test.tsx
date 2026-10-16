import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { createAuthStub } from '@/test/authStub';
import { TEST_ACCOUNT } from '@/test/fixtures';
import { createRegisterStub } from '@/test/registerStub';
import { App } from './App';

const SUCCESS = 'Cuenta creada correctamente. Ya puedes iniciar sesión';

function renderApp(path = '/') {
  window.history.replaceState(null, '', path);
  const authStub = createAuthStub();
  const registerStub = createRegisterStub();
  const view = render(
    <App authenticate={authStub.authenticate} register={registerStub.register} />,
  );
  return { authStub, registerStub, view };
}

async function registerSuccessfully(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
  await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
  await user.type(screen.getByLabelText('Contraseña'), 'clave-segura-1');
  await user.type(screen.getByLabelText('Confirmar contraseña'), 'clave-segura-1');
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
}

describe('App · navegación', () => {
  it('N6: acceso directo a /registro muestra el registro', () => {
    renderApp('/registro');
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
  });

  it('N6: acceso directo a /login muestra el login', () => {
    renderApp('/login');
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });

  it.each(['/', '/xyz'])('N6: %s termina en /login', (path) => {
    renderApp(path);
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('T-NAV-01/US1-2: registro exitoso → /login con el aviso de éxito', async () => {
    const user = userEvent.setup();
    renderApp('/registro');
    await registerSuccessfully(user);
    expect(await screen.findByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(screen.getByRole('status')).toHaveTextContent(SUCCESS);
  });

  it('US1-5/N2: tras una recarga (remontar la app en /login) no hay aviso', async () => {
    const user = userEvent.setup();
    const { view } = renderApp('/registro');
    await registerSuccessfully(user);
    await screen.findByText(SUCCESS);
    view.unmount();
    render(
      <App authenticate={createAuthStub().authenticate} register={createRegisterStub().register} />,
    );
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(screen.queryByText(SUCCESS)).not.toBeInTheDocument();
  });

  it('N3: ir a /registro y volver con «Atrás» no muestra el aviso', async () => {
    const user = userEvent.setup();
    renderApp('/registro');
    await registerSuccessfully(user);
    await screen.findByText(SUCCESS);
    act(() => {
      window.history.pushState(null, '', '/registro');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    act(() => {
      window.history.pushState(null, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.queryByText(SUCCESS)).not.toBeInTheDocument();
  });

  it('FR-017: el flujo de login existente sigue funcionando', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await user.type(screen.getByLabelText('Contraseña'), TEST_ACCOUNT.password);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('heading', { name: /Bienvenido,/ })).toBeInTheDocument();
  });
});

describe('App · US5 navegación entre pantallas', () => {
  it('N4/US5-1: «Inicia sesión» en /registro lleva a /login sin aviso de éxito', async () => {
    renderApp('/registro');
    await userEvent.click(screen.getByRole('link', { name: 'Inicia sesión' }));
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(screen.queryByText(SUCCESS)).not.toBeInTheDocument();
  });

  it('N5: «Regístrate» en /login lleva a /registro', async () => {
    renderApp('/login');
    await userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/registro');
  });

  it('N3: «Atrás» restaura la pantalla anterior', async () => {
    renderApp('/login');
    await userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
    act(() => {
      window.history.pushState(null, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });
});

describe('App · accesibilidad de la pantalla completa (FR-015, SC-005)', () => {
  it('vista de login sin violaciones', async () => {
    const { view } = renderApp('/login');
    await expectNoA11yViolations(view.container);
  });

  it('vista de login con errores visibles sin violaciones', async () => {
    const { view } = renderApp('/login');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(view.container);
  });

  it('vista de bienvenida sin violaciones', async () => {
    const { view } = renderApp('/login');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await userEvent.type(screen.getByLabelText('Contraseña'), TEST_ACCOUNT.password);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await screen.findByRole('heading', { name: /Bienvenido,/ });
    await expectNoA11yViolations(view.container);
  });

  it('T-A11Y-01: registro vacío sin violaciones', async () => {
    const { view } = renderApp('/registro');
    await expectNoA11yViolations(view.container);
  });

  it('T-A11Y-01: registro con los cinco errores visibles sin violaciones', async () => {
    const { view } = renderApp('/registro');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await expectNoA11yViolations(view.container);
  });

  it('T-A11Y-01: registro con el aviso «Próximamente» sin violaciones', async () => {
    const { view } = renderApp('/registro');
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(view.container);
  });

  it('T-A11Y-01: login con el aviso de éxito sin violaciones', async () => {
    const user = userEvent.setup();
    const { view } = renderApp('/registro');
    await registerSuccessfully(user);
    await screen.findByText(SUCCESS);
    await expectNoA11yViolations(view.container);
  });

  it('FR-019: orden de tabulación del registro', async () => {
    const user = userEvent.setup();
    renderApp('/registro');
    const expected = [
      screen.getByLabelText('Nombre completo'),
      screen.getByLabelText('Correo electrónico'),
      screen.getByLabelText('Contraseña'),
      ...screen.getAllByRole('button', { name: 'Mostrar contraseña' }).slice(0, 1),
      screen.getByLabelText('Confirmar contraseña'),
      ...screen.getAllByRole('button', { name: 'Mostrar contraseña' }).slice(1),
      screen.getByRole('checkbox'),
      screen.getByRole('button', { name: 'términos y condiciones' }),
      screen.getByRole('button', { name: 'Crear cuenta' }),
      screen.getByRole('button', { name: 'Google' }),
      screen.getByRole('button', { name: 'Apple' }),
      screen.getByRole('link', { name: 'Inicia sesión' }),
    ];
    for (const element of expected) {
      await user.tab();
      expect(element).toHaveFocus();
    }
  });
});
