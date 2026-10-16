# Research: Pantalla de Registro de Usuarios de KynWallet

**Feature**: `002-registro-usuario` | **Date**: 2026-10-16

Resuelve las decisiones técnicas del plan. No quedan `NEEDS CLARIFICATION`.

## R1. Existencia de backend de registro

- **Decision**: no existe; el registro es una simulación solo-cliente detrás de un puerto.
- **Evidence**: búsqueda en `src/` y `package.json` sin `fetch`, `axios`, XHR, `/api`, cliente
  HTTP ni documentación de servicio; `AuthGateway` solo expone `authenticate`.
- **Rationale**: la instrucción es no inventar endpoints ni simular un registro real sin
  documentarlo. El puerto aísla la simulación y deja el punto de sustitución explícito.
- **Alternatives considered**: llamar a una URL ficticia (inventa un contrato inexistente,
  rechazado); guardar la cuenta en `localStorage` (almacenaría datos personales/contraseña,
  contradice 5.3/5.4 y la spec).

## R2. Enrutamiento sin dependencias nuevas

- **Decision**: enrutador mínimo propio (`NavigationProvider` + `useNavigation` + `Link`) sobre
  `history.pushState/replaceState` y el evento `popstate`. Rutas `/login` y `/registro`; `/` y
  desconocidas → `/login` con `replace`.
- **Rationale**: dos rutas estáticas; cero dependencias (4.2, 4.3, 7.4); testeable con la History
  API de jsdom; sustituible detrás de `useNavigation`.
- **Alternatives considered**: `react-router` (dependencia y modelo desproporcionados para dos
  pantallas); *hash routing* (`#/login`) (no cumple «navegue a `/login`»); renderizado
  condicional sin URL (no cumple acceso directo ni botón atrás).
- **Nota de hosting**: `vite dev`/`vite preview` hacen *fallback* a `index.html`; un servidor
  estático real necesita la misma regla. Se documenta en el README.

## R3. Transporte del aviso de éxito

- **Decision**: `flash` en memoria dentro del estado del proveedor de navegación; se limpia en
  cualquier navegación posterior y se pierde al recargar.
- **Rationale**: la spec exige que no persista tras recargar ni tras navegar y volver, y que no
  viajen datos personales. `history.state` y `sessionStorage` sobreviven a una recarga; los
  parámetros de URL son compartibles y quedarían en el historial.
- **Alternatives considered**: `?registered=1` (persiste en recarga y en el historial); `history.state`
  (sobrevive a la recarga); `sessionStorage` (almacenamiento innecesario y viola la spec).

## R4. Puerto y caso de uso de registro

- **Decision**: `RegistrationGateway.register(account) → Promise<RegistrationResult>` con
  `success | unavailable`; `createRegister(gateway)` valida (`invalid` con errores por campo),
  normaliza el correo y convierte excepciones en `unavailable`. `SimulatedRegistrationGateway`
  espera `delayMs` (1000) y devuelve `success`.
- **Rationale**: mismo patrón y capas que `authenticate`; la validación en el caso de uso cumple
  5.1 (validar en el límite) sin depender de la UI.
- **Alternatives considered**: validar solo en la UI (la regla de negocio quedaría en
  presentación, 3.3); un puerto que valide (mezcla responsabilidades, 2.1).

## R5. Estrategia de validación y mensajes

- **Decision**: `validateRegistration` en dominio, reutilizando `isValidEmail`, `normalizeEmail` y
  los límites de contraseña. Mensajes en `MESSAGES`; se reutilizan `EMAIL_*` y `PASSWORD_*`.
- **Mensajes nuevos**: `NAME_REQUIRED` «Ingresa tu nombre completo», `NAME_TOO_LONG` «El nombre no
  puede superar 100 caracteres», `CONFIRM_REQUIRED` «Confirma tu contraseña», `PASSWORD_MISMATCH`
  «Las contraseñas no coinciden», `TERMS_REQUIRED` «Debes aceptar los términos y condiciones»,
  `REGISTER_UNAVAILABLE` «No pudimos crear tu cuenta. Intenta más tarde.», `REGISTER_SUCCESS`
  «Cuenta creada correctamente. Ya puedes iniciar sesión», `COMING_SOON` «Próximamente».
- **Rationale**: una sola fuente (4.1); mismo modelo de «tocado + recalculo» que login.
- **Nombre**: obligatorio tras `trim`, máximo 100; sin lista de caracteres permitidos más allá de
  longitud (acentos, ñ, apóstrofes y guiones válidos). Es entrada de texto libre, y la salida se
  renderiza como texto por React (sin `dangerouslySetInnerHTML`).

## R6. Alertas «Próximamente» (Google, Apple, términos)

- **Decision**: se reutiliza el patrón de aviso de login (`Alert tone="info"`, `role="status"`)
  con un único aviso visible a la vez (el segundo clic reemplaza, no acumula). Se usa un aviso
  inline y no `window.alert()`.
- **Rationale**: «alerta» del requerimiento se interpreta como aviso visible y anunciado; el
  `window.alert` bloquea el hilo, es difícil de probar y rompe el diseño. Si el producto exige el
  diálogo nativo, el cambio está aislado en el manejador. **A confirmar en la revisión del plan.**
- **Alternatives considered**: `window.alert` (peor accesibilidad y pruebas); toast flotante
  (componente nuevo sin necesidad).

## R7. Lectura del frame `04 · Registro` (Figma) y diferencias con `01 · Login`

Datos verificados con el MCP en la copia `onwn9nLuHU8DzpFUOpZNRv`, nodo `31:2` (1440 × 1024).

| Elemento | Frame 04 · Registro | Frame 01 · Login (ya implementado) |
|---|---|---|
| Degradado del panel | `linear-gradient(70.73°, #ff8a65 31.7%, #ef5226 83.5%)` | `linear-gradient(121.19°, #ff8a65 0%, #ef5226 70.71%)` |
| Titular | «Comienza tu / camino financiero.» en y = 400 | «Tu dinero, sin fronteras.» en y = 346 |
| Subtexto | «…administrar tu dinero desde cualquier lugar.» | «Envía, recibe y paga en segundos…» |
| Título del formulario | «Crea tu cuenta», top = 140 | «Bienvenido de nuevo», top = 250 (centrado) |
| Ritmo entre campos | etiqueta→input 7 px; entre campos 16 px | gap de 22 px |
| Panel de marca / formulario | 620 px / 820 px; columna x = 820–1220 (400 px) | igual |
| Campos | nombre, correo, contraseña, confirmación (52 px, radio 12, borde 1.5 px `#d7d9e6`) | correo, contraseña |
| Checkbox | 20×20, radio 6, texto 14/500 con enlace `#ef5226` 14/600 | «Recordarme» |
| Botón principal | 400×52, `#ff6b3d`, «Crear cuenta» 16/600 | «Iniciar sesión» |
| Separador / sociales | «o regístrate con»; 192×48 con 16 px de hueco | «o continúa con»; 194×48 con 12 px |
| Pie | «¿Ya tienes cuenta? Inicia sesión» (y = 798) | «¿No tienes cuenta? Regístrate» |
| Tipografía | Inter 400/500/600/700 | Inter |
| Variables | `get_variable_defs` devolvió `{}` (valores sin variables) | tokens de 001 |

- **Decision**: reutilizar `tokens.css`; añadir `--brand-gradient-signup`; resolver las diferencias
  mediante la `variant` de `BrandPanel` y un módulo CSS propio del formulario.
- **Nota**: los gaps de los botones sociales (16 px frente a 12 px) y el ritmo del formulario se
  fijan por el frame 04 en `RegisterForm.module.css`.
- **No obtenido de Figma**: estados (foco, error, deshabilitado), versión móvil, sombras,
  validaciones y los logotipos reales de Google/Apple. Se resuelven con los estados de 001.

## R8. Contraste (Constitución 8.4)

- **Decision**: heredar los tokens accesibles de 001 (`--brand-700`, `--neutral-600`,
  `--neutral-border`, `--danger-600`). El texto de enlace `#ef5226` del frame se sustituye por
  `--brand-700` (como en login). Para el aviso de éxito se añade `--success-700` sobre
  `--success-50`; sus valores finales se fijan midiendo el ratio con el helper de contraste y deben
  alcanzar ≥ 4.5:1 (`#166534` sobre `#dcfce7`: **6.49:1 medido**).
- **Rationale**: 8.4 es obligatorio; la desviación respecto a Figma queda registrada y pendiente de
  aprobación del responsable de diseño (8.6), igual que en 001.

## R9. Responsive

- **Decision**: móvil primero; < 768 px solo formulario (`hideOnMobile`); 768–959 px franja con
  logo (comportamiento actual); ≥ 960 px dos paneles; ≥ 1280 px panel fijo de 620 px.
- **Rationale**: respeta los breakpoints existentes (960/1280) y cumple el requisito de la spec;
  entre 960 y 1023 px el resultado (dos paneles) es un superconjunto de «≥ 1024 px».
- **Verificación**: jsdom no evalúa *media queries*; se prueban los atributos que activan cada
  modo y se verifica el resultado visual manualmente (quickstart).

## R10. Layout compartido

- **Decision**: mover `LoginScreen` a `ui/layout/AuthLayout` (props `brand`, `children`) y dejar
  `LoginScreen` como composición delgada; `RegisterScreen` usa el mismo layout.
- **Rationale**: evita duplicar la rejilla responsive (4.1); no cambia el comportamiento de login.
- **Alternatives considered**: duplicar `LoginScreen.module.css` (DRY violado); una pantalla
  genérica con `switch` interno (mezcla responsabilidades).

## R11. Enlaces navegables

- **Decision**: componente `Link` (`<a href>`) con el aspecto de `Button variant="link"`; maneja el
  clic con `navigate` salvo con teclas modificadoras o clic central.
- **Rationale**: «Inicia sesión» y «Regístrate» son navegación, no acciones: deben anunciarse como
  enlaces (US5-3) y poder abrirse en pestaña nueva.
- **Alternatives considered**: `Button variant="link"` con `onClick` (se anuncia como botón y no
  admite abrir en pestaña nueva).

## R12. Pruebas de navegación y de «recarga»

- **Decision**: la History API de jsdom permite `pushState` y disparar `popstate`; «recarga» se
  simula desmontando y montando `App` con la misma URL (la memoria se pierde).
- **Alternatives considered**: Playwright/Cypress (dependencia y entorno nuevos, YAGNI).
