import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithNavigation } from '@/test/renderWithNavigation';
import { Link } from './Link';

describe('Link', () => {
  it('renderiza un <a> con el href de la ruta y rol link', () => {
    renderWithNavigation(<Link to="/registro">Regístrate</Link>);
    expect(screen.getByRole('link', { name: 'Regístrate' })).toHaveAttribute('href', '/registro');
  });

  it('un clic simple navega y cancela la navegación del navegador', () => {
    renderWithNavigation(<Link to="/registro">Regístrate</Link>);
    const notCancelled = fireEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
    expect(notCancelled).toBe(false);
    expect(window.location.pathname).toBe('/registro');
  });

  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
  ])('con %j conserva el comportamiento nativo (no navega)', (modifier) => {
    renderWithNavigation(<Link to="/registro">Regístrate</Link>);
    const notCancelled = fireEvent.click(
      screen.getByRole('link', { name: 'Regístrate' }),
      modifier,
    );
    expect(notCancelled).toBe(true);
    expect(window.location.pathname).toBe('/login');
  });

  it('US5-3: es alcanzable con Tab y se activa con Enter', async () => {
    const user = userEvent.setup();
    renderWithNavigation(<Link to="/registro">Regístrate</Link>);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Regístrate' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(window.location.pathname).toBe('/registro');
  });
});
