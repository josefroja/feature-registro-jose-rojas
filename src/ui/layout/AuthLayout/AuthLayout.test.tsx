import { render, screen } from '@testing-library/react';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renderiza el panel de marca y el contenido dentro de <main>', () => {
    render(
      <AuthLayout brand={<p>Marca</p>}>
        <p>Formulario</p>
      </AuthLayout>,
    );
    expect(screen.getByText('Marca')).toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(screen.getByText('Formulario'));
    expect(screen.getByRole('main')).not.toContainElement(screen.getByText('Marca'));
  });

  it('FR-001: formAlign="top" lo expone como data-form-align y por defecto no lo marca', () => {
    const { rerender } = render(
      <AuthLayout brand={<p>Marca</p>}>
        <p>Formulario</p>
      </AuthLayout>,
    );
    expect(screen.getByRole('main')).not.toHaveAttribute('data-form-align');
    rerender(
      <AuthLayout brand={<p>Marca</p>} formAlign="top">
        <p>Formulario</p>
      </AuthLayout>,
    );
    expect(screen.getByRole('main')).toHaveAttribute('data-form-align', 'top');
  });
});
