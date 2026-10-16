# Implementation Plan: Pantalla de Registro de Usuarios de KynWallet

**Branch**: `002-registro-usuario` | **Date**: 2026-10-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-registro-usuario/spec.md`

## Summary

Pantalla de registro fiel al frame `04 · Registro` de Figma (nodo `31:2`), construida sobre el
stack y la arquitectura de la funcionalidad 001: React 19 + TypeScript + Vite, Clean Architecture
ligera (`domain` → `application` → `infrastructure` / `ui`), CSS Modules con tokens y componentes
reutilizables. **No se añade ninguna dependencia.**

Tres hechos reales del proyecto (verificados, ver spec) determinan el diseño:

1. **No existe backend de registro** → el registro se resuelve con un caso de uso y un puerto
   `RegistrationGateway` cuya única implementación es `SimulatedRegistrationGateway` (espera
   breve, sin red, sin persistencia). La simulación se documenta en README y contratos.
2. **No existe router ni ruta `/login`** → se añade un enrutador mínimo propio sobre la History
   API del navegador (≈ 60 líneas, solo dos rutas), en lugar de una librería.
3. **No existe almacenamiento** → el aviso de éxito en `/login` viaja en **memoria** (estado del
   enrutador), no en la URL, `history.state` ni `sessionStorage`; desaparece solo al recargar o
   al navegar, como exige la spec.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), Node.js ≥ 20 LTS (sin cambios)

**Primary Dependencies**: React 19, Vite 8, `@fontsource-variable/inter` — **sin nuevas
dependencias** (ni `react-router`, ni librería de formularios, ni de validación)

**Storage**: N/A. Estado en memoria; el registro no persiste nada

**Testing**: Vitest 5, React Testing Library, `user-event`, jsdom, helper `axe-core`
(`src/test/a11y.ts`), cobertura v8 con umbral 80 % — todo ya existente

**Target Platform**: navegadores modernos, de 320 px a escritorio (igual que 001)

**Project Type**: SPA solo-frontend (proyecto único en la raíz)

**Performance Goals**: resultado del intento ≤ 2 s (SC-002) con espera simulada de 1 s

**Constraints**: sin backend ni red; WCAG 2.1 AA; sin contraseñas en logs, URL, estado de
historial ni almacenamiento; sin scroll horizontal desde 320 px; la pantalla de login conserva su
comportamiento (salvo el enlace «Regístrate», ver más abajo)

**Scale/Scope**: 1 pantalla nueva, 1 enrutador mínimo, 1 caso de uso, 1 puerto, 1 adaptador,
3 componentes reutilizables ampliados, 1 componente nuevo (`Link`)

## Constitution Check

*GATE: se verifica antes de Phase 0 y se re-verifica tras Phase 1.*

| Principio / Regla | Cumplimiento en el diseño | Estado |
|---|---|---|
| I. TDD | Cada capa se desarrolla en rojo → verde: dominio → caso de uso → adaptador → reducer → componentes → integración. Pruebas nombradas con ID de escenario (`US1-1`, `FR-009`, …) | ✅ |
| II. SOLID | `RegistrationGateway` es una abstracción inyectada desde `main.tsx` (DIP); `BrandPanel`, `Checkbox`, `Alert` se extienden por props sin cambiar su comportamiento actual (OCP) | ✅ |
| III. Clean Architecture | Reglas de validación en `domain/`; orquestación en `application/`; adaptador en `infrastructure/`; el enrutador y las pantallas en `ui/`. ESLint `no-restricted-imports` ya impone la regla de dependencias; se mantiene | ✅ |
| IV. DRY/KISS/YAGNI | Se reutilizan `isValidEmail`, `normalizeEmail`, límites de contraseña y textos de `MESSAGES`; enrutador propio en vez de dependencia (justificado en Complexity Tracking); sin librerías de formularios ni estado global | ✅ |
| V. Seguridad | Validación en el límite (caso de uso valida de nuevo antes del puerto); mensajes de error sin detalles internos; contraseña fuera de URL, historial, logs y almacenamiento; el aviso de éxito no lleva datos personales | ✅ |
| VI. BRD/ARD | No existen (supuesto de la spec). Si aparecen, el contrato del puerto es el punto de alineación | ✅ N/A |
| 7. Dependencias | Ninguna nueva; `audit:deps` y `audit:licenses` siguen en `verify` | ✅ |
| 8.1 Pruebas | Unitarias, de componente e integración; cobertura ≥ 80 % global sin disminuir | ✅ |
| 8.2 Convenciones | ESLint + Prettier + `tsc --noEmit` (script `verify`) | ✅ |
| 8.3 Documentación | README actualizado (registro simulado, rutas, hosting SPA); contratos en esta carpeta | ✅ |
| 8.4 Accesibilidad AA | Roles/etiquetas por contrato; `axe` sobre ambas pantallas; contraste con los tokens accesibles de 001 y un token nuevo para el aviso de éxito | ✅ |
| 8.5 Reutilización | Se reutilizan 8 componentes existentes; solo se crea `Link` (no existía un enlace navegable) | ✅ |
| 8.6 Sistema de diseño | Mismos tokens que 001 + 2 tokens nuevos de Figma (degradado del frame 04, éxito). Las desviaciones de contraste de 001 siguen pendientes de aprobación de diseño | ⚠️ heredada |
| 5.5 / 8.7 Observabilidad y eventos de seguridad | La demo es solo-cliente, sin backend ni datos sensibles que auditar: no se emiten logs ni métricas (`no-console` en ESLint; FR-014 prohíbe registrar contraseñas). Un adaptador real DEBERÁ emitir logs estructurados de los eventos de registro | ✅ con justificación |
| 8.1 Pruebas de contrato | El único adaptador es la simulación, cubierta por `SimulatedRegistrationGateway.test.ts` contra las reglas R1–R3 del contrato. Si aparece un adaptador real se extrae una suite de contrato reutilizable | ✅ proporcional al riesgo |
| 9.5 Verificación en planificación | Esta tabla; las desviaciones quedan en Complexity Tracking | ✅ |
| 9.2 Trazabilidad | Tabla de escenarios T-* de la spec → pruebas nombradas por ID; tareas referenciarán FR/US | ✅ |

**Resultado del gate**: APROBADO. Sin violaciones nuevas; una desviación heredada (contraste, 001)
y una justificación en Complexity Tracking.

**Re-check post-diseño (Phase 1)**: data-model y contratos no añaden dependencias ni capas; las
mismas conclusiones se mantienen.

## Project Structure

### Documentation (this feature)

```text
specs/002-registro-usuario/
├── plan.md
├── research.md                      # Phase 0: decisiones y lectura de Figma
├── data-model.md                    # Phase 1
├── quickstart.md                    # Phase 1
├── contracts/
│   ├── registration-gateway.md      # puerto + adaptador simulado (sin endpoints)
│   ├── navigation.md                # rutas, aviso de éxito, historial
│   └── ui-registro.md               # contrato observable de la pantalla
├── checklists/requirements.md
└── tasks.md                         # Phase 2 (/speckit-tasks)
```

## Componentes y archivos a crear o modificar

Leyenda: **N** nuevo · **M** modificado · **=** sin cambios (reutilizado tal cual).

### Dominio (`src/domain/`)

| | Archivo | Cambio |
|---|---|---|
| N | `registration.ts` | Tipos `RegistrationData`, `NewAccount` (nombre, correo normalizado, contraseña), `RegistrationErrors`, `RegistrationResult` (`success` / `invalid` / `unavailable`) |
| N | `registrationValidation.ts` (+ `.test.ts`) | `validateRegistration(data)`; `isValidFullName`; reutiliza `isValidEmail`, `normalizeEmail`, `PASSWORD_MIN/MAX_LENGTH` |
| M | `messages.ts` | Añade `NAME_REQUIRED`, `NAME_TOO_LONG`, `CONFIRM_REQUIRED`, `PASSWORD_MISMATCH`, `TERMS_REQUIRED`, `REGISTER_UNAVAILABLE`, `REGISTER_SUCCESS`, `COMING_SOON` («Próximamente»). Reutiliza `EMAIL_*` y `PASSWORD_*` existentes |
| = | `validation.ts`, `auth.ts` | Sin cambios (login intacto) |

### Aplicación (`src/application/`)

| | Archivo | Cambio |
|---|---|---|
| N | `ports/RegistrationGateway.ts` | `register(account: NewAccount): Promise<RegistrationResult>` |
| N | `register.ts` (+ `.test.ts`) | `createRegister(gateway)`: valida, normaliza el correo, no llama al puerto si hay errores, captura excepciones → `unavailable` |

### Infraestructura (`src/infrastructure/`)

| | Archivo | Cambio |
|---|---|---|
| N | `SimulatedRegistrationGateway.ts` (+ `.test.ts`) | Espera `delayMs` (1000 por defecto), devuelve `success`; descarta los datos; sin red, sin logs, sin almacenamiento. Cabecera del archivo declara que es una simulación |

### UI — navegación (`src/ui/navigation/`) — nuevo

| | Archivo | Cambio |
|---|---|---|
| N | `routes.ts` (+ test) | `ROUTES = { login: '/login', register: '/registro' }`, `resolveRoute(pathname)` (`/` y desconocidas → login) |
| N | `NavigationProvider.tsx` (+ test) | Estado `{ path, flash }`; `navigate(to, { flash?, replace? })` con `history.pushState/replaceState`; escucha `popstate`; fija `document.title` por ruta |
| N | `useNavigation.ts` | Hook de contexto: `{ path, flash, navigate }` |
| N | `ui/components/Link/Link.tsx` (+ css, test) | `<a href>` con `onClick` que llama a `navigate` (respeta Ctrl/Cmd/clic central); estilo idéntico al `Button` variante `link` |

### UI — pantalla de registro (`src/ui/features/register/`) — nuevo

| | Archivo | Cambio |
|---|---|---|
| N | `registerReducer.ts` (+ test) | Estado `editing / submitting / failed`; valores, tocados, errores visibles, términos; mismo patrón que `loginReducer` |
| N | `useRegisterForm.ts` | Une reducer + caso de uso; evita doble envío; invoca `onRegistered` solo si montado |
| N | `RegisterForm.tsx` (+ css, test) | Formulario según el frame 04 |
| N | `RegisterScreen.tsx` | `AuthLayout` + `BrandPanel` (variante registro) + `RegisterForm` |

### UI — componentes y layout existentes

| | Archivo | Cambio |
|---|---|---|
| M | `ui/layout/BrandPanel/BrandPanel.tsx` + css | Props `title`, `description`, `variant: 'login' \| 'register'` y `hideOnMobile`. Textos de login pasan a ser los valores por defecto; variante `register` aplica el degradado y el desplazamiento vertical del titular del frame 04 |
| M | `ui/features/login/LoginScreen.tsx` + css → `ui/layout/AuthLayout/AuthLayout.tsx` + css | Se **mueve y generaliza** el layout de dos paneles para compartirlo (DRY): recibe `brand` y `children`. `LoginScreen` se conserva como composición delgada |
| M | `ui/components/Checkbox/Checkbox.tsx` + css | Props opcionales `error` (con `aria-invalid` + `aria-describedby`) y `ref`; permite enfocar el primer error. Comportamiento actual intacto |
| M | `ui/components/Alert/Alert.tsx` + css | Nuevo tono `success` (`role="status"`) |
| M | `ui/components/TextField/TextField.tsx` | Solo si hace falta `aria-required`; el resto se reutiliza (`autoComplete`, `name`, `error`) |
| M | `ui/features/login/LoginForm.tsx` | «Regístrate» pasa de aviso a `Link` hacia `/registro`; nueva prop opcional `successMessage` mostrada en un `Alert tone="success"` |
| M | `ui/features/login/LoginForm.test.tsx` | Se actualiza la prueba de «Regístrate» (antes verificaba el aviso «no disponible») y se añade la del `successMessage` |
| M | `ui/styles/tokens.css` | `--brand-gradient-signup` (70.73°, `#ff8a65 31.7%` → `#ef5226 83.5%`), `--success-700`, `--success-50` |
| = | `Button`, `PasswordField`, `SocialButton`, `Divider`, `TextField` | Reutilizados sin cambios |
| M | `App.tsx` + `App.test.tsx` | Envuelve en `NavigationProvider`; `switch` por ruta; recibe `authenticate` y `register` |
| M | `main.tsx` | Raíz de composición: crea `createRegister(new SimulatedRegistrationGateway())` y lo inyecta |
| M | `index.html` | El `<title>` inicial pasa a ser neutro («KynWallet»); el título por ruta lo fija el enrutador |
| M | `README.md` | Rutas, registro simulado (**sin backend**), requisito de *fallback* a `index.html` en hosting estático |
| M | `eslint.config.js` | Sin cambios previstos; las nuevas carpetas ya quedan cubiertas por las reglas de `domain`, `application` y `ui` |

## Estrategia de validaciones y navegación

### Validaciones

- **Una sola fuente** (Principio IV): `validateRegistration` en `domain/` produce `RegistrationErrors`
  por campo; el reducer, el caso de uso y las pruebas la usan. Los textos viven en `MESSAGES`.
- **Reglas** (FR-004 a FR-007): nombre obligatorio (trim) y ≤ 100; correo obligatorio, formato
  y ≤ 254 (reutilizando `isValidEmail`); contraseña 8–128 sin recortar; confirmación obligatoria
  e idéntica; términos marcados.
- **Cuándo se muestran** (mismo modelo que login): al **salir** del campo (`blur`) se marca como
  tocado; mientras está tocado se recalcula en cada cambio; al **enviar** se marcan todos y se
  muestran todos los errores a la vez. El error de «no coinciden» pertenece a la confirmación y se
  recalcula si cambia cualquiera de las dos contraseñas (si la confirmación ya fue tocada). El
  error de términos aparece al enviar o al desmarcar tras haberlo intentado.
- **Foco** (FR-009): tras un envío con errores, el foco va al primer campo con error en el orden
  nombre → correo → contraseña → confirmación → términos (por eso `Checkbox` acepta `ref`).
- **Defensa en profundidad** (Constitución 5.1): `createRegister` revalida antes de llamar al
  puerto; la UI no es la única barrera. SC-004 se prueba comprobando que el puerto no se invoca.
- **Anti doble envío**: `inFlight` (como en `useLoginForm`) + `submitting` deshabilita el botón.

### Navegación (detalle en `contracts/navigation.md`)

- Rutas: `/login`, `/registro`; `/` y cualquier ruta desconocida → `/login` con `replace`
  (sin añadir entradas al historial).
- `navigate(to, { flash })` hace `pushState` con estado **vacío**: ningún dato viaja en la URL ni
  en `history.state`. El `flash` vive solo en el estado de React del proveedor.
- Registro exitoso: `navigate('/login', { flash: 'registered' })`. El proveedor limpia el `flash`
  en **cualquier** navegación posterior (incluido `popstate`); una recarga lo pierde porque es solo
  memoria. `LoginForm` recibe `successMessage` cuando hay `flash`.
- El enlace «Inicia sesión» y «Regístrate» son `Link` (`<a href>`): operables con teclado y
  anunciados como enlaces; se puede abrir en pestaña nueva (carga la ruta directa).
- `vite dev` y `vite preview` ya aplican *fallback* SPA; en hosting estático real hay que
  redirigir cualquier ruta a `index.html` (documentado en README; no es código del proyecto).

## Adaptación responsive

Se parte de la convención existente (móvil primero; 960 px y 1280 px ya son breakpoints de 001) y
se añade el requisito de la spec.

| Ancho | Panel de marca | Formulario |
|---|---|---|
| < 768 px (móvil) | **Oculto** (`hideOnMobile`) | Único contenido; padding 16–24 px; sin scroll horizontal desde 320 px |
| 768–959 px | Franja superior solo con el logo (comportamiento actual de `BrandPanel`) | Columna centrada, máx. 400 px |
| 960–1279 px | Dos paneles; marca al 43 % | Columna de 400 px centrada |
| ≥ 1280 px | Dos paneles; marca fija de 620 px (Figma) | Columna de 400 px centrada |

- Los dos paneles de escritorio coinciden con la spec («escritorio ≥ 1024 px»); entre 960 y
  1023 px también se muestran dos paneles, lo que es un superconjunto válido del requisito.
- Los botones Google/Apple mantienen la rejilla de 2 columnas desde 320 px (cada botón ≥ 130 px).
- **Limitación de pruebas**: jsdom no calcula layout ni evalúa *media queries*. La parte
  automatizable (atributos/clases que activan cada modo) se prueba en componente; el
  comportamiento visual se verifica manualmente a 320, 375, 768, 1024 y 1440 px siguiendo
  `quickstart.md`, y queda registrado como evidencia de T-RSP-01 y T-VIS-01.

## Integración con los estilos y componentes existentes

- **Estilos**: CSS Modules por componente + `tokens.css` como fuente única; ningún valor de color
  fijo en los módulos nuevos. Medidas del frame 04 (verificadas): formulario de 400 px, inputs de
  52 px y radio 12, gap entre campos de 16 px (el login usa 22 px, por eso `RegisterForm.module.css`
  define su propio ritmo), título 30 px/700, etiquetas 14/500, botón 52 px, sociales 48 px.
- **Diferencias de Figma entre `01 · Login` y `04 · Registro`** que el plan contempla: el degradado
  del panel (70.73° con paradas 31.7 %/83.5 % frente a 121.19°) y la posición vertical del titular
  (y = 400 frente a 346). Se resuelven con la `variant` de `BrandPanel`, sin duplicar el panel.
- **Contraste**: se usan los tokens accesibles ya definidos (`--brand-700`, `--neutral-600`,
  `--neutral-border`, `--danger-600`); el color de enlace del frame (`#EF5226`) se sustituye por
  `--brand-700` igual que en login. Misma desviación pendiente de aprobación (8.6).
- **Reutilización**: `TextField`, `PasswordField` (dos instancias independientes), `Checkbox`,
  `Button` (primario y `variant="link"` para «términos y condiciones»), `SocialButton`, `Divider`,
  `Alert`, `BrandPanel`, `AuthLayout`. «Acepto los términos y condiciones»: el texto se compone
  con el `label` del `Checkbox` aceptando contenido enriquecido (`label: ReactNode`) para alojar
  el enlace, sin crear otro componente.
- **Iconos**: se reutilizan `eye.svg`, `logo-mark.svg` y el marcador `social-placeholder.svg`
  (Figma 04 usa el mismo círculo genérico). No hay assets nuevos que descargar.

## Estrategia de pruebas

TDD estricto (Principio I): cada elemento nace con su prueba en rojo. Las pruebas viven junto al
código y se nombran con el ID del escenario (`US2-1`, `FR-007`, …). Mapeo a la spec:

| Capa / archivo de prueba | Escenarios cubiertos |
|---|---|
| `registrationValidation.test.ts` | T-DOM-01…05 — límites 0/1/100/101 (nombre), 7/8/128/129 (contraseña), 254/255 (correo), espacios, acentos, coincidencia exacta, todos los errores a la vez |
| `register.test.ts` | T-APP-01/02 — no llama al puerto si hay errores (SC-004); normaliza el correo; excepción → `unavailable`; éxito |
| `SimulatedRegistrationGateway.test.ts` | T-INF-01 — devuelve éxito tras `delayMs`; no usa `fetch`/almacenamiento (se espía `fetch` y `Storage`) |
| `registerReducer.test.ts` | transiciones, `touched`, errores visibles, recálculo cruzado de la confirmación, envío ignorado en `submitting` |
| `RegisterForm.test.tsx` | T-UI-01…08 — flujo feliz con carga y doble envío, vacío → 5 errores + foco, correo inline, contraseñas, visibilidad independiente, Google/Apple → «Próximamente» sin acumular, fallo conserva nombre/correo y vacía contraseñas, Enter envía |
| `NavigationProvider.test.tsx`, `routes.test.ts`, `Link.test.tsx` | rutas, `/` y desconocida → login con `replace`, `popstate`, `flash` de un solo uso, `Link` con modificadores de teclado |
| `LoginForm.test.tsx` (actualizado) | `successMessage` visible y con `role="status"`; «Regístrate» navega |
| `App.test.tsx` (ampliado) | T-NAV-01/02 — registro exitoso → `/login` con aviso; no reaparece tras «recargar» (remontar la app con la misma URL); acceso directo a cada ruta; login intacto; T-A11Y-01 con `axe` en registro (vacío, con errores, con alerta «Próximamente») |
| `BrandPanel` / `AuthLayout` tests | T-RSP-01 (parte automatizable): `hideOnMobile` y `variant` aplican los atributos/clases esperados |
| Revisión manual (quickstart) | T-RSP-01 visual, T-VIS-01 contra Figma, T-DOC-01 (README/contratos) |

- **Cobertura**: umbral 80 % global (ya configurado); la lógica de validación y el reducer se
  prueban en el 100 % de ramas (SC-003). `verify` completo debe pasar antes de integrar (9.4).
- **Sin pruebas E2E ni librerías nuevas**: la integración se cubre con RTL sobre `App` y la History
  API de jsdom (YAGNI, coherente con 001).
- **Doble de prueba**: se amplía `src/test/` con `registerStub.ts` (análogo a `authStub.ts`).

## Tratamiento del registro exitoso según las capacidades reales del proyecto

| Capacidad | Realidad verificada | Decisión |
|---|---|---|
| Backend / endpoint | No existe | Puerto `RegistrationGateway` + adaptador simulado. **No se define ningún endpoint**; `contracts/registration-gateway.md` describe qué debe cumplir un adaptador real |
| Persistencia | No existe | No se guarda nada; la cuenta «creada» **no podrá iniciar sesión** (login solo acepta cuentas de `VITE_DEMO_USERS`). Se documenta y se informa en la revisión de la spec |
| Router | No existe | Enrutador mínimo propio (ver Complexity Tracking) |
| Mensaje entre pantallas | Sin almacenamiento | `flash` en memoria del proveedor; sin URL, sin `history.state`, sin storage; se pierde al recargar (requisito de la spec) |
| Duplicados | No hay almacén de cuentas | No se detectan (supuesto de la spec) |
| Transparencia al usuario | — | El mensaje de éxito es el exigido («Cuenta creada correctamente. Ya puedes iniciar sesión»); la limitación vive en README, contrato y notas de la spec, no se inventa en la UI |

Cuando exista un backend, el cambio se limita a un nuevo adaptador de `RegistrationGateway` y su
alta en `main.tsx`; dominio, caso de uso y UI no cambian (Principio II.2).

## Complexity Tracking

| Desviación / complejidad | Por qué es necesaria | Alternativa más simple rechazada porque |
|---|---|---|
| Enrutador propio (≈ 60 líneas) sobre History API en lugar de `react-router` | La spec exige `/login` y navegación real (acceso directo, recarga, botón atrás). Solo hay 2 rutas y ninguna es dinámica | `react-router` añade una dependencia grande y un modelo de rutas para 2 pantallas (4.2, 4.3, 7.4). Un `useState` sin URL incumple FR-017. Si el producto crece a más rutas, el enrutador se sustituye detrás de `useNavigation` sin tocar las pantallas |
| Mover `LoginScreen` a `AuthLayout` compartido | El registro necesita exactamente el mismo layout de dos paneles; duplicarlo violaría 4.1 | Copiar `LoginScreen` y su CSS duplicaría las reglas responsive |
| Tono `success` en `Alert` y 2 tokens nuevos | El aviso de éxito necesita estilo propio y accesible | Reutilizar `info` no comunica éxito; hardcodear colores viola 8.6 |
| Cambio en la pantalla de login («Regístrate» ahora navega) | Sin él, el enlace del diseño quedaría roto y la navegación incompleta (FR-017) | Dejar el aviso «no disponible» contradice el objetivo de esta funcionalidad. Es un cambio de 001 deliberado y cubierto por prueba |
| Desviaciones de contraste heredadas de 001 | WCAG 2.1 AA es obligatorio (8.4) | Reproducir los colores exactos de Figma incumple 8.4. Pendiente de aprobación de diseño |

## Riesgos y puntos abiertos

- **La cuenta registrada no puede iniciar sesión** (decisión pendiente de confirmar con producto).
- **Archivo de Figma**: las medidas salen de la copia `onwn9nLuHU8DzpFUOpZNRv`; si el original
  difiere, se revisa en la verificación visual (T-VIS-01).
- **Hosting estático**: requiere *fallback* a `index.html`; fuera del alcance de código.

## Ajustes surgidos en implementación y revisión

- `Checkbox` mantiene `label: string` y añade `labelSuffix?: ReactNode` (en vez de `label: ReactNode`):
  el `<label>` no contiene un botón y el nombre accesible incluye el enlace mediante `aria-labelledby`.
- `hideOnMobile` es una prop de `BrandPanel`; `AuthLayout` solo recibe `brand` y `formAlign`.
- Fidelidad al frame 04 (verificada midiendo posiciones con Chrome frente a Figma): `AuthLayout`
  admite `formAlign="top"` (formulario a 140 px del borde superior y a 200 px del panel); `BrandPanel`
  variante `register` usa el logo de dos formas de Figma (`logo-dot.svg`, `logo-dot-2.svg`), titular con
  interlineado de 52 px y tarjeta con las coordenadas del frame.
- Desviaciones visuales deliberadas respecto a Figma (accesibilidad, Constitución 8.4; pendientes de
  aprobación de diseño): colores del botón, enlaces, bordes y placeholders (tokens `--brand-700`,
  `--neutral-600`, `--neutral-border`) y los iconos del ojo (contorno) y de Google/Apple (círculo
  oscuro), de los que Figma usa versiones de bajo contraste (`#A9ABC2` al 50 %).
