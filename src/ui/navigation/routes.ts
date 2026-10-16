export const ROUTES = {
  login: '/login',
  register: '/registro',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/** `/` y cualquier ruta desconocida resuelven al login: nunca una pantalla en blanco. */
export function resolveRoute(pathname: string): Route {
  return pathname === ROUTES.register ? ROUTES.register : ROUTES.login;
}
