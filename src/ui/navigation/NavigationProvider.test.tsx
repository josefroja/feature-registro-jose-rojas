import { act, render, screen } from '@testing-library/react';
import { NavigationProvider } from './NavigationProvider';
import { useNavigation } from './useNavigation';

function Probe() {
  const { path, flash, navigate } = useNavigation();
  return (
    <>
      <p data-testid="path">{path}</p>
      <p data-testid="flash">{flash ?? 'none'}</p>
      <button onClick={() => navigate('/registro')}>a-registro</button>
      <button onClick={() => navigate('/login', { flash: 'registered' })}>a-login-flash</button>
      <button onClick={() => navigate('/login')}>a-login</button>
      <button onClick={() => navigate('/registro', { replace: true })}>reemplazar</button>
    </>
  );
}

const renderProvider = () =>
  render(
    <NavigationProvider>
      <Probe />
    </NavigationProvider>,
  );

const click = (name: string) => act(() => screen.getByRole('button', { name }).click());

describe('NavigationProvider', () => {
  it('el path inicial sale de window.location.pathname', () => {
    window.history.pushState(null, '', '/registro');
    renderProvider();
    expect(screen.getByTestId('path')).toHaveTextContent('/registro');
  });

  it.each(['/', '/xyz'])('N6: %s redirige a /login con replaceState', (initial) => {
    window.history.pushState(null, '', initial);
    const length = window.history.length;
    const replaceState = vi.spyOn(window.history, 'replaceState');
    renderProvider();
    expect(screen.getByTestId('path')).toHaveTextContent('/login');
    expect(replaceState).toHaveBeenCalledWith(null, '', '/login');
    expect(window.history.length).toBe(length);
    expect(window.location.pathname).toBe('/login');
    replaceState.mockRestore();
  });

  it('navigate hace pushState con estado null y actualiza el path', () => {
    window.history.pushState(null, '', '/login');
    renderProvider();
    click('a-registro');
    expect(screen.getByTestId('path')).toHaveTextContent('/registro');
    expect(window.location.pathname).toBe('/registro');
    expect(window.history.state).toBeNull();
  });

  it('navigate con replace usa replaceState y no añade entradas al historial', () => {
    window.history.pushState(null, '', '/login');
    renderProvider();
    const length = window.history.length;
    click('reemplazar');
    expect(screen.getByTestId('path')).toHaveTextContent('/registro');
    expect(window.history.length).toBe(length);
  });

  it('N1/FR-014: el flash vive en memoria, sin datos en URL ni history.state', () => {
    window.history.pushState(null, '', '/registro');
    renderProvider();
    click('a-login-flash');
    expect(screen.getByTestId('flash')).toHaveTextContent('registered');
    expect(window.history.state).toBeNull();
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('');
  });

  it('N3: otra navegación limpia el flash', () => {
    window.history.pushState(null, '', '/registro');
    renderProvider();
    click('a-login-flash');
    click('a-registro');
    expect(screen.getByTestId('flash')).toHaveTextContent('none');
    click('a-login');
    expect(screen.getByTestId('flash')).toHaveTextContent('none');
  });

  it('N3: popstate limpia el flash y actualiza el path', () => {
    window.history.pushState(null, '', '/registro');
    renderProvider();
    click('a-login-flash');
    act(() => {
      window.history.pushState(null, '', '/registro');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByTestId('path')).toHaveTextContent('/registro');
    expect(screen.getByTestId('flash')).toHaveTextContent('none');
  });

  it('N2: al volver a montar (recarga) no hay flash', () => {
    window.history.pushState(null, '', '/registro');
    const first = renderProvider();
    click('a-login-flash');
    first.unmount();
    renderProvider();
    expect(screen.getByTestId('path')).toHaveTextContent('/login');
    expect(screen.getByTestId('flash')).toHaveTextContent('none');
  });

  it('actualiza document.title por ruta', () => {
    window.history.pushState(null, '', '/login');
    renderProvider();
    expect(document.title).toBe('KynWallet · Iniciar sesión');
    click('a-registro');
    expect(document.title).toBe('KynWallet · Crear cuenta');
  });

  it('useNavigation fuera del proveedor lanza un error claro', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(/NavigationProvider/);
    error.mockRestore();
  });
});
