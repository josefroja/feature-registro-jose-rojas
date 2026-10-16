import { createContext, useContext } from 'react';
import type { Route } from './routes';

export type Flash = 'registered';

export type NavigateOptions = {
  replace?: boolean;
  /** Aviso de un solo uso: vive solo en memoria, nunca en la URL ni en el historial. */
  flash?: Flash;
};

export type Navigation = {
  path: Route;
  flash: Flash | null;
  navigate: (to: Route, options?: NavigateOptions) => void;
};

export const NavigationContext = createContext<Navigation | null>(null);

export function useNavigation(): Navigation {
  const navigation = useContext(NavigationContext);
  if (!navigation) throw new Error('useNavigation requiere un NavigationProvider');
  return navigation;
}
