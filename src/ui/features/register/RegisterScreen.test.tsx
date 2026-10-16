import { screen } from '@testing-library/react';
import { createAuthStub } from '@/test/authStub';
import { createRegisterStub } from '@/test/registerStub';
import { renderWithNavigation } from '@/test/renderWithNavigation';
import { LoginForm } from '../login/LoginForm';
import { LoginScreen } from '../login/LoginScreen';
import { RegisterScreen } from './RegisterScreen';

describe('RegisterScreen · US7 responsive', () => {
  it('T-RSP-01: el panel de marca es de la variante register y se oculta en móvil; el formulario siempre está', () => {
    const { container } = renderWithNavigation(
      <RegisterScreen register={createRegisterStub().register} onRegistered={() => undefined} />,
      '/registro',
    );
    const panel = container.querySelector('header');
    expect(panel).toHaveAttribute('data-variant', 'register');
    expect(panel).toHaveAttribute('data-hide-on-mobile', 'true');
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Crea tu cuenta' }),
    );
  });

  it('FR-001: el panel de marca muestra los textos del frame 04', () => {
    renderWithNavigation(
      <RegisterScreen register={createRegisterStub().register} onRegistered={() => undefined} />,
      '/registro',
    );
    expect(screen.getByText(/camino financiero\./)).toBeInTheDocument();
    expect(
      screen.getByText(
        'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.',
      ),
    ).toBeInTheDocument();
  });

  it('T-RSP-01: el login conserva su franja de logo en móvil (no se oculta)', () => {
    const { container } = renderWithNavigation(
      <LoginScreen>
        <LoginForm authenticate={createAuthStub().authenticate} />
      </LoginScreen>,
    );
    const panel = container.querySelector('header');
    expect(panel).toHaveAttribute('data-variant', 'login');
    expect(panel).not.toHaveAttribute('data-hide-on-mobile');
  });
});
