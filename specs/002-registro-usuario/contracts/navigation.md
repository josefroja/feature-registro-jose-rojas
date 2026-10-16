# Contract: Navegación entre pantallas

Enrutador mínimo propio sobre la History API (ver research R2). Sin dependencias nuevas.

## Rutas

| Ruta | Pantalla | Notas |
|---|---|---|
| `/login` | Inicio de sesión (funcionalidad 001) | Muestra el aviso de éxito si hay `flash` |
| `/registro` | Registro (esta funcionalidad) | |
| `/` | — | Redirige a `/login` con `replace` |
| Cualquier otra | — | Redirige a `/login` con `replace` (nunca pantalla en blanco) |

## API de UI

```ts
type NavigateOptions = { replace?: boolean; flash?: 'registered' };
useNavigation(): { path: Route; flash: 'registered' | null; navigate(to: Route, o?: NavigateOptions): void }
```

- `navigate` llama a `history.pushState(null, '', to)` (o `replaceState`). El estado del historial
  es siempre `null`: **ningún dato viaja en la URL ni en `history.state`**.
- `flash` vive solo en el estado de React del proveedor y se **limpia en cualquier navegación
  posterior** (incluido `popstate`). Una recarga lo elimina.
- El proveedor escucha `popstate` y actualiza `path`. Fija `document.title` por ruta:
  `/login` → «KynWallet · Iniciar sesión»; `/registro` → «KynWallet · Crear cuenta».

## `Link`

`<Link to="/login">Inicia sesión</Link>` renderiza `<a href="/login">`. Un clic sin teclas
modificadoras ni botón secundario/central llama a `navigate` y cancela la navegación del
navegador; en los demás casos conserva el comportamiento nativo (por ejemplo, abrir en pestaña
nueva, que carga la ruta directa).

## Escenarios

| # | Dado | Resultado |
|---|---|---|
| N1 | Registro exitoso | `navigate('/login', { flash: 'registered' })`; el login muestra el aviso de éxito |
| N2 | En `/login` con aviso, recarga | Sin aviso |
| N3 | En `/login` con aviso, ir a `/registro` y volver con «Atrás» | Sin aviso |
| N4 | «Inicia sesión» en `/registro` | `/login` sin aviso, sin datos del formulario |
| N5 | «Regístrate» en `/login` | `/registro` |
| N6 | Acceso directo a `/registro`, `/login`, `/` o ruta desconocida | La pantalla correspondiente (o login) |

## Hosting

`vite dev` y `vite preview` aplican *fallback* a `index.html`. En un hosting estático real debe
configurarse la misma regla (cualquier ruta → `index.html`); se documenta en el README.
