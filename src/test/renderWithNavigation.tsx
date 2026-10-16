import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { NavigationProvider } from '@/ui/navigation/NavigationProvider';

/** Renderiza dentro de un NavigationProvider, opcionalmente partiendo de una ruta. */
export function renderWithNavigation(ui: ReactElement, path = '/login') {
  window.history.replaceState(null, '', path);
  return render(<NavigationProvider>{ui}</NavigationProvider>);
}
