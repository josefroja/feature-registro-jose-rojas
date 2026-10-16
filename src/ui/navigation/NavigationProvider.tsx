import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { resolveRoute, ROUTES, type Route } from './routes';
import { NavigationContext, type Flash, type NavigateOptions } from './useNavigation';

const TITLES: Record<Route, string> = {
  [ROUTES.login]: 'KynWallet · Iniciar sesión',
  [ROUTES.register]: 'KynWallet · Crear cuenta',
};

type State = { path: Route; flash: Flash | null };

const readLocation = (): State => ({ path: resolveRoute(window.location.pathname), flash: null });

/**
 * Enrutador mínimo sobre la History API (research.md R2). El estado del historial es siempre
 * `null` y el aviso (`flash`) solo existe en memoria: se pierde al recargar o al navegar.
 */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(readLocation);

  // `/` y las rutas desconocidas se normalizan a /login sin añadir entradas al historial.
  useEffect(() => {
    if (window.location.pathname !== state.path) {
      window.history.replaceState(null, '', state.path);
    }
  }, [state.path]);

  useEffect(() => {
    document.title = TITLES[state.path];
  }, [state.path]);

  useEffect(() => {
    const onPopState = () => setState(readLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: Route, options: NavigateOptions = {}) => {
    const method = options.replace ? 'replaceState' : 'pushState';
    window.history[method](null, '', to);
    setState({ path: to, flash: options.flash ?? null });
  }, []);

  const value = useMemo(
    () => ({ path: state.path, flash: state.flash, navigate }),
    [state.path, state.flash, navigate],
  );

  return <NavigationContext value={value}>{children}</NavigationContext>;
}
