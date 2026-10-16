import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { Checkbox } from './Checkbox';

function Controlled() {
  const [checked, setChecked] = useState(false);
  return <Checkbox label="Recordarme" checked={checked} onChange={setChecked} />;
}

describe('Checkbox', () => {
  it('US5-2: casilla con etiqueta que alterna su estado', async () => {
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox', { name: 'Recordarme' });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    await userEvent.click(screen.getByText('Recordarme'));
    expect(checkbox).not.toBeChecked();
  });

  it('FR-010: con error expone aria-invalid y aria-describedby hacia el mensaje', () => {
    render(
      <Checkbox label="Acepto" checked={false} onChange={() => undefined} error="Obligatorio" />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Acepto' });
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAccessibleDescription('Obligatorio');
    expect(screen.getByText('Obligatorio')).toBeVisible();
  });

  it('FR-010: sin error no expone aria-invalid ni aria-describedby', () => {
    render(<Checkbox label="Acepto" checked={false} onChange={() => undefined} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Acepto' });
    expect(checkbox).not.toHaveAttribute('aria-invalid');
    expect(checkbox).not.toHaveAttribute('aria-describedby');
  });

  it('FR-009: acepta ref para enfocar la casilla', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} label="Acepto" checked={false} onChange={() => undefined} />);
    ref.current?.focus();
    expect(screen.getByRole('checkbox')).toHaveFocus();
  });

  it('FR-015: labelSuffix aporta una acción junto a la etiqueta sin cambiar el estado', async () => {
    const onChange = vi.fn();
    const onLink = vi.fn();
    render(
      <Checkbox
        label="Acepto los"
        labelSuffix={
          <button type="button" onClick={onLink}>
            términos
          </button>
        }
        checked={false}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Acepto los términos' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'términos' }));
    expect(onLink).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('FR-015: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Controlled />);
    await expectNoA11yViolations(container);
  });
});
