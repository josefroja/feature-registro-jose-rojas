import { resolveRoute, ROUTES } from './routes';

describe('routes', () => {
  it('contrato: /login y /registro', () => {
    expect(ROUTES.login).toBe('/login');
    expect(ROUTES.register).toBe('/registro');
  });

  it.each([
    ['/login', '/login'],
    ['/registro', '/registro'],
  ])('N6: %s se resuelve a %s', (pathname, route) => {
    expect(resolveRoute(pathname)).toBe(route);
  });

  it.each(['/', '/xyz', '', '/login/', '/registro/extra'])(
    'N6: %j (ruta desconocida) se resuelve a /login',
    (pathname) => {
      expect(resolveRoute(pathname)).toBe('/login');
    },
  );
});
