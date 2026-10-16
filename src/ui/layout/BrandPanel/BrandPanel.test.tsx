import { render, screen } from '@testing-library/react';
import { BrandPanel } from './BrandPanel';

describe('BrandPanel', () => {
  it('conserva los textos y la variante de login por defecto', () => {
    const { container } = render(<BrandPanel />);
    expect(container.querySelector('header')).toHaveAttribute('data-variant', 'login');
    expect(screen.getByText(/sin fronteras\./)).toBeInTheDocument();
    expect(screen.getByText(/Envía, recibe y paga en segundos/)).toBeInTheDocument();
    expect(container.querySelector('header')).not.toHaveAttribute('data-hide-on-mobile');
  });

  it('FR-001: variante register con título y descripción propios', () => {
    const { container } = render(
      <BrandPanel
        variant="register"
        title={
          <>
            Comienza tu
            <br />
            camino financiero.
          </>
        }
        description="Crea tu cuenta en minutos."
      />,
    );
    expect(container.querySelector('header')).toHaveAttribute('data-variant', 'register');
    expect(screen.getByText(/camino financiero\./)).toBeInTheDocument();
    expect(screen.getByText('Crea tu cuenta en minutos.')).toBeInTheDocument();
    expect(screen.queryByText(/sin fronteras/)).not.toBeInTheDocument();
  });

  it('la tarjeta ilustrativa permanece oculta a tecnologías de asistencia', () => {
    const { container } = render(<BrandPanel />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('Kyn Card');
  });

  it('FR-001: el logo de login usa una sola imagen y el del frame 04 usa las dos formas de Figma', () => {
    const login = render(<BrandPanel />);
    expect(login.container.querySelectorAll('header img')).toHaveLength(1);
    login.unmount();
    const register = render(<BrandPanel variant="register" />);
    expect(register.container.querySelectorAll('header img')).toHaveLength(2);
    expect(screen.getByText('KynWallet')).toBeInTheDocument();
  });

  it('T-RSP-01: hideOnMobile expone data-hide-on-mobile', () => {
    const { container } = render(<BrandPanel hideOnMobile />);
    expect(container.querySelector('header')).toHaveAttribute('data-hide-on-mobile', 'true');
  });
});
