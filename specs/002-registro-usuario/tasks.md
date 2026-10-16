---

description: "Task list for 002-registro-usuario"
---

# Tasks: Pantalla de Registro de Usuarios de KynWallet

**Input**: Design documents from `/specs/002-registro-usuario/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/registration-gateway.md,
contracts/navigation.md, contracts/ui-registro.md, quickstart.md

**Tests**: OBLIGATORIAS. La Constitución (Principio I, TDD) exige escribir cada prueba antes del
código y verla fallar. En cada historia, las tareas de prueba preceden a las de implementación.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US7, de spec.md)
- Rutas relativas a la raíz del repositorio. Las pruebas viven junto al código (`*.test.ts(x)`).
- Trazabilidad (Constitución 9.2): cada `it(...)` DEBE empezar con el ID del escenario o
  requisito que verifica, p. ej. `it('US2-1: muestra los cinco errores…')`, `it('FR-007: …')`.
- Alias `@/` → `src/`. Capas: `domain` ← `application` ← `ui`; `infrastructure` solo se importa
  desde `src/main.tsx` (ESLint lo impone). **No se añade ninguna dependencia** a `package.json`.
- «Ver fallar»: tras escribir las pruebas, ejecutar `npx vitest run <archivo>` y confirmar que
  fallan por la razón esperada (módulo o comportamiento inexistente) antes de implementar.
- Las fases siguen el orden de prioridad de la spec: P1 (US1–US4) → P2 (US5, US7) → P3 (US6).

---

## Phase 1: Setup

**Purpose**: Partir de una base verificada. No hay inicialización de proyecto: el repositorio ya
tiene React 19 + TypeScript + Vite + Vitest + ESLint + Prettier (funcionalidad 001).

- [X] T001 Ejecutar `npm run verify` en la rama actual y confirmar que pasa íntegro (lint, formato, tipos, pruebas con cobertura, build, auditorías, secretos); anotar la cobertura global de partida para no disminuirla (Constitución 8.1). Si falla por falta de `.env.local`, copiar `.env.example` a `.env.local` (no versionado)
- [X] T002 [P] Confirmar que los assets existentes cubren el frame `04 · Registro` sin descargar nada nuevo: `src/ui/assets/logo-mark.svg`, `src/ui/assets/eye.svg` y `src/ui/assets/social-placeholder.svg` (research R7: el frame 04 usa los mismos marcadores). Anotar el resultado como comentario en el PR, no en el código

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dominio, caso de uso, adaptador simulado, enrutador y piezas de UI compartidas que
necesitan todas las historias.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta completar esta fase.

### Dominio

- [X] T003 Crear `src/domain/registration.ts` con los tipos `RegistrationData` (`fullName`, `email`, `password`, `confirmPassword`, `acceptedTerms: boolean`), `RegistrationField` (unión de esas claves), `RegistrationErrors` (`Partial<Record<RegistrationField, string>>`), `NewAccount` (`fullName`, `email`, `password`) y `RegistrationResult` (`{kind:'success'} | {kind:'invalid'; errors: RegistrationErrors} | {kind:'unavailable'}`), según `data-model.md`
- [X] T004 Añadir a `src/domain/messages.ts` (sin tocar las claves existentes) `NAME_REQUIRED: 'Ingresa tu nombre completo'`, `NAME_TOO_LONG: 'El nombre no puede superar 100 caracteres'`, `CONFIRM_REQUIRED: 'Confirma tu contraseña'`, `PASSWORD_MISMATCH: 'Las contraseñas no coinciden'`, `TERMS_REQUIRED: 'Debes aceptar los términos y condiciones'`, `REGISTER_UNAVAILABLE: 'No pudimos crear tu cuenta. Intenta más tarde.'`, `REGISTER_SUCCESS: 'Cuenta creada correctamente. Ya puedes iniciar sesión'`, `COMING_SOON: 'Próximamente'`
- [X] T005 [P] Escribir `src/domain/registrationValidation.test.ts` (verlo fallar). Casos con ID: **FR-004** nombre vacío, solo espacios, 100 válido, 101 → `NAME_TOO_LONG`, «María José O'Neil-Peña» válido; **FR-005** correo vacío → `EMAIL_REQUIRED`, `usuario@`/`usuario.com`/`a@b` → `EMAIL_INVALID`, 254 válido y 255 inválido, mayúsculas y espacios periféricos válidos; **FR-006** contraseña vacía, 7 → `PASSWORD_TOO_SHORT`, 8 válida, 128 válida, 129 → `PASSWORD_TOO_LONG`, espacios respetados (8 espacios es válida); **FR-007** confirmación vacía → `CONFIRM_REQUIRED`, distinta → `PASSWORD_MISMATCH`, diferencia de mayúsculas o de un espacio final → `PASSWORD_MISMATCH`, no se informa `PASSWORD_MISMATCH` si la contraseña es inválida; **FR-003** `acceptedTerms: false` → `TERMS_REQUIRED`; **FR-009** formulario vacío devuelve los cinco errores a la vez y formulario válido devuelve `{}`
- [X] T006 Implementar `src/domain/registrationValidation.ts`: exportar `FULL_NAME_MAX_LENGTH = 100`, `isValidFullName` y `validateRegistration(data): RegistrationErrors`; reutilizar `isValidEmail`, `normalizeEmail`, `PASSWORD_MIN_LENGTH`, `PASSWORD_MAX_LENGTH` de `src/domain/validation.ts` y los textos de `MESSAGES` (Constitución 4.1); la contraseña no se recorta; el nombre sí. Hacer pasar T005 sin modificarlo

### Aplicación

- [X] T007 Crear `src/application/ports/RegistrationGateway.ts` con `interface RegistrationGateway { register(account: NewAccount): Promise<RegistrationResult> }` (contracts/registration-gateway.md)
- [X] T008 [P] Escribir `src/application/register.test.ts` con un gateway falso (verlo fallar). Casos: **U1/SC-004** con datos inválidos devuelve `{kind:'invalid', errors}` y `gateway.register` NO se llama; **U2/FR-011** con datos válidos llama al gateway con `fullName` recortado, `email` normalizado (minúsculas, sin espacios) y `password` intacta, y devuelve su resultado; **U3/FR-013** si el gateway lanza una excepción devuelve `{kind:'unavailable'}` y la promesa no se rechaza; el gateway devolviendo `unavailable` se propaga
- [X] T009 Implementar `src/application/register.ts`: `export type Register = (data: RegistrationData) => Promise<RegistrationResult>` y `createRegister(gateway: RegistrationGateway): Register` (valida con `validateRegistration`, normaliza, delega, captura excepciones); sin importar React ni infraestructura. Hacer pasar T008

### Infraestructura

- [X] T010 [P] Escribir `src/infrastructure/SimulatedRegistrationGateway.test.ts` (verlo fallar) con temporizadores falsos (`vi.useFakeTimers`). Casos: **R1** `register()` con `delayMs: 0` resuelve `{kind:'success'}`; con el retardo por defecto no resuelve antes de 1000 ms y sí a los 1000 ms; **R3/FR-014/T-INF-01** no llama a `fetch` (espía `globalThis.fetch`), no escribe en `localStorage`/`sessionStorage` (espía `Storage.prototype.setItem`) y no llama a `console.*`; el resultado no contiene la contraseña
- [X] T011 Implementar `src/infrastructure/SimulatedRegistrationGateway.ts`: `class SimulatedRegistrationGateway implements RegistrationGateway` con `constructor(options?: { delayMs?: number })` (1000 por defecto) y `register()` que espera y devuelve `{ kind: 'success' }` sin leer, guardar ni registrar los datos (implementar el método sin parámetros nombrados; TypeScript lo admite). Cabecera del archivo: comentario que declara que es una **simulación sin backend** y apunta a `specs/002-registro-usuario/contracts/registration-gateway.md` (FR-021). Hacer pasar T010

### UI compartida

- [X] T012 [P] Añadir a `src/ui/styles/tokens.css`: `--brand-gradient-signup: linear-gradient(70.73deg, #ff8a65 31.7%, #ef5226 83.5%)`, `--success-700` y `--success-50` (propuesta: `#166534` sobre `#dcfce7`). Calcular la razón de contraste WCAG de `--success-700` sobre `--success-50` con un cálculo puntual (script en el scratchpad, no versionado) y ajustar hasta ≥ 4.5:1; anotar el valor medido en un comentario junto al token, como hacen los demás tokens
- [X] T013 [P] Escribir pruebas del tono `success` en `src/ui/components/Alert/Alert.test.tsx` (ampliar el archivo existente; verlas fallar): `Alert tone="success"` se renderiza con `role="status"` y su texto; los tonos `error` (`role="alert"`) e `info` (`role="status"`) no cambian
- [X] T014 Implementar el tono `success` en `src/ui/components/Alert/Alert.tsx` (tipo `tone: 'error' | 'info' | 'success'`, `role="status"` para `success`) y la clase `.success` en `src/ui/components/Alert/Alert.module.css` con `--success-700`/`--success-50`. Hacer pasar T013
- [X] T015 [P] Escribir pruebas de la ampliación de `Checkbox` en `src/ui/components/Checkbox/Checkbox.test.tsx` (ampliar; verlas fallar): **FR-010** con `error` el input tiene `aria-invalid="true"` y `aria-describedby` apunta al mensaje visible; sin `error` ambos atributos están ausentes; acepta `ref` y `ref.current.focus()` enfoca el input; `label` acepta contenido (`ReactNode`) con un botón dentro y el nombre accesible del checkbox sigue siendo el texto de la etiqueta; el comportamiento previo de «Recordarme» no cambia
- [X] T016 Implementar en `src/ui/components/Checkbox/Checkbox.tsx` y `Checkbox.module.css` las props opcionales `error?: string`, `ref?: Ref<HTMLInputElement>` y `label: ReactNode` (hoy `string`), con el mismo patrón de ids que `TextField` (`${id}-error`, `aria-invalid`, `aria-describedby`) y estilo de error con `--danger-600`. Un `<label>` no debe envolver al botón interactivo: la etiqueta asocia solo el texto y el contenido enriquecido va fuera del `<label htmlFor>` pero dentro del mismo contenedor (jsx-a11y debe pasar). Hacer pasar T015
- [X] T017 [P] Escribir `src/ui/layout/BrandPanel/BrandPanel.test.tsx` (nuevo; verlo fallar). Casos: sin props conserva los textos de login («Tu dinero, / sin fronteras.» y su subtexto) y `data-variant="login"`; con `variant="register"`, `title` y `description` muestra «Comienza tu / camino financiero.» y el subtexto del frame 04 y `data-variant="register"`; la tarjeta sigue con `aria-hidden`
- [X] T018 Implementar en `src/ui/layout/BrandPanel/BrandPanel.tsx` y `BrandPanel.module.css` las props `title?: ReactNode`, `description?: string` y `variant?: 'login' | 'register'` (por defecto `login`, con los textos actuales como valores por defecto) y atributo `data-variant`. La variante `register` aplica `--brand-gradient-signup` y el desplazamiento vertical del titular del frame 04 (research R7: titular en y = 400 en un lienzo de 1024 frente a 346 en login). Hacer pasar T017
- [X] T019 [P] Escribir `src/ui/layout/AuthLayout/AuthLayout.test.tsx` (nuevo; verlo fallar): renderiza `brand` y `children` (el `children` dentro de un `<main>`); sin cambios en la estructura que usaba `LoginScreen`
- [X] T020 Mover con `git mv` `src/ui/features/login/LoginScreen.tsx` y `LoginScreen.module.css` a `src/ui/layout/AuthLayout/AuthLayout.tsx` y `AuthLayout.module.css`; generalizar a `AuthLayout({ brand, children })` conservando íntegras las reglas responsive actuales; recrear `src/ui/features/login/LoginScreen.tsx` como composición delgada (`<AuthLayout brand={<BrandPanel />}>{children}</AuthLayout>`) para no alterar el login. Hacer pasar T019 y confirmar que las pruebas existentes de login siguen verdes

### Navegación

- [X] T021 [P] Escribir `src/ui/navigation/routes.test.ts` (verlo fallar). Casos: `ROUTES.login === '/login'` y `ROUTES.register === '/registro'`; `resolveRoute('/login')`, `'/registro'` las resuelven; `'/'`, `'/xyz'`, `''` y `'/login/'` resuelven a `'/login'` (**N6**)
- [X] T022 Implementar `src/ui/navigation/routes.ts` con `ROUTES`, el tipo `Route` y `resolveRoute(pathname): Route`. Hacer pasar T021
- [X] T023 [P] Escribir `src/ui/navigation/NavigationProvider.test.tsx` (verlo fallar) con un componente de prueba que lee `useNavigation`. Casos: el `path` inicial sale de `window.location.pathname`; en `/` y en ruta desconocida se llama a `history.replaceState` hacia `/login` sin aumentar `history.length`; `navigate('/registro')` hace `pushState` con estado `null` y actualiza `path`; **N1/N2/N3** `navigate('/login', { flash: 'registered' })` expone `flash === 'registered'`, otra `navigate` posterior lo limpia, un evento `popstate` lo limpia, y al desmontar y montar de nuevo (simula recarga) `flash` es `null`; **FR-014** `history.state` es `null` tras navegar con `flash` y la URL no contiene parámetros; `document.title` cambia por ruta («KynWallet · Iniciar sesión» / «KynWallet · Crear cuenta»); `useNavigation` fuera del proveedor lanza un error claro
- [X] T024 Implementar `src/ui/navigation/NavigationProvider.tsx` y `src/ui/navigation/useNavigation.ts` (contexto con `{ path, flash, navigate }`; `navigate(to, { replace?, flash? })`; listener `popstate` con limpieza en el `useEffect`; título por ruta). Contrato en `contracts/navigation.md`. Hacer pasar T023
- [X] T025 [P] Ampliar `src/test/setup.ts` con un `afterEach` que restablezca `window.history.replaceState(null, '', '/')` y `document.title`, para que las pruebas no dependan del orden (Constitución 1.4); crear `src/test/renderWithNavigation.tsx` (helper que envuelve en `NavigationProvider` y acepta `path` inicial) y `src/test/registerStub.ts` (análogo a `src/test/authStub.ts`: `createRegisterStub(result)` con `register` como `vi.fn`, `defer()` y `release()`)

**Checkpoint**: dominio, caso de uso, adaptador, enrutador y piezas compartidas listos; `npm run test` verde.

---

## Phase 3: User Story 1 - Crear una cuenta con datos válidos (Priority: P1) 🎯 MVP

**Goal**: completar el formulario con datos válidos, crear la cuenta (simulada) y llegar a `/login` con el aviso de éxito.

**Independent Test**: abrir `/registro`, completar los cuatro campos, marcar términos, pulsar «Crear cuenta» y verificar la redirección a `/login` con el mensaje de éxito (quickstart paso 8–9).

### Tests for User Story 1 ⚠️ (escribir primero y verlos fallar)

- [X] T026 [P] [US1] Escribir `src/ui/features/register/registerReducer.test.ts` (nuevo). Casos: estado inicial `editing` con valores vacíos y `acceptedTerms: false`; `change` actualiza el campo; `toggleTerms` cambia `acceptedTerms`; **US1-3/FR-011** `submit` válido → `submitting` y un segundo `submit` se ignora (misma referencia); `submit` con errores sigue en `editing`; **FR-013** `result` `unavailable` → `failed`, conserva `fullName` y `email` y vacía `password` y `confirmPassword`; editar un campo en `failed` vuelve a `editing` y limpia el error global
- [X] T027 [P] [US1] Escribir `src/ui/features/register/RegisterForm.test.tsx` (nuevo; usa `renderWithNavigation` y `createRegisterStub`). Casos: **US1-1** con datos válidos y términos marcados, «Crear cuenta» llama a `register` una vez con los cinco campos; **US1-3** mientras la promesa está pendiente el botón muestra «Creando cuenta…», tiene `aria-busy`, está deshabilitado y un segundo clic no vuelve a llamar a `register`; **US1-1** al resolver `success` se llama a `onRegistered` una sola vez; **US1-4** pulsar Enter en un campo de texto envía el formulario válido; **FR-013/T-UI-08** con `unavailable` aparece `role="alert"` «No pudimos crear tu cuenta. Intenta más tarde.», nombre y correo conservados, contraseñas vacías y botón habilitado; no se llama a `onRegistered`; si el componente se desmonta antes de resolver no hay actualización de estado ni error
- [X] T028 [P] [US1] Ampliar `src/ui/features/login/LoginForm.test.tsx` (verlo fallar): con la prop `successMessage="Cuenta creada correctamente. Ya puedes iniciar sesión"` se muestra en un elemento con `role="status"` encima del formulario (**US1-2/FR-012**); sin la prop no se renderiza ningún aviso de éxito
- [X] T029 [P] [US1] Ampliar `src/App.test.tsx` (verlo fallar; usar `createAuthStub` y `createRegisterStub`, `window.history.pushState` para fijar la ruta). Casos: **T-NAV-01/US1-2** en `/registro`, registro exitoso → `window.location.pathname === '/login'` y el aviso de éxito visible; **US1-5/N2** desmontar y volver a montar `App` en `/login` (simula recarga) no muestra el aviso; **N3** tras el registro ir a `/registro` y volver con `history.back()` no muestra el aviso; **N6** acceso directo a `/registro` muestra «Crea tu cuenta», `/login` muestra el login, `/` y `/xyz` terminan en `/login`; **FR-017** el flujo de login existente (credenciales válidas → bienvenida) sigue funcionando

### Implementation for User Story 1

- [X] T030 [US1] Implementar `src/ui/features/register/registerReducer.ts`: `RegisterState` (`status: 'editing' | 'submitting' | 'failed'`, `values`, `acceptedTerms`, `touched`, `fieldErrors`, `submitAttempted`, `notice`) y acciones `change`, `toggleTerms`, `submit`, `result` (data-model.md); en esta fase `submit` solo decide `editing` vs `submitting` usando `validateRegistration`; los demás campos del estado se inicializan para las historias siguientes. Hacer pasar T026
- [X] T031 [US1] Implementar `src/ui/features/register/useRegisterForm.ts` (patrón de `src/ui/features/login/useLoginForm.ts`): `useReducer` + `inFlight` + `mounted`; `submit()` valida, y si procede llama a `register(values)` y, con `success`, invoca `onRegistered()` solo si el componente sigue montado; con `unavailable` despacha `result`. Firma `useRegisterForm(register: Register, onRegistered: () => void)`
- [X] T032 [US1] Implementar `src/ui/features/register/RegisterForm.tsx` y `RegisterForm.module.css` según `contracts/ui-registro.md` y el frame `04 · Registro` (research R7): `<form noValidate>`, `<h1>` «Crea tu cuenta», subtítulo «Completa tus datos para comenzar», `TextField` «Nombre completo» (`name="fullName"`, `autoComplete="name"`, placeholder «Ej: Diego Martínez»), `TextField` «Correo electrónico» (`type="email"`, `autoComplete="email"`, placeholder «tucorreo@ejemplo.com»), dos `PasswordField` («Contraseña» y «Confirmar contraseña», `autoComplete="new-password"`, placeholder «••••••••»), `Checkbox` «Acepto los términos y condiciones», `Alert tone="error"` para `failed`, `Button type="submit"` «Crear cuenta» con `loading`/`loadingLabel="Creando cuenta…"`, `Divider` «o regístrate con», `SocialButton` Google y Apple (sin manejador aún), y pie «¿Ya tienes cuenta?» (el enlace llega en US5). CSS: columna de 400 px, gap de 16 px entre campos, título 30 px/700, subtítulo 16 px, solo tokens de `tokens.css` (sin colores fijos). Props: `{ register: Register; onRegistered: () => void }`. Hacer pasar T027
- [X] T033 [US1] Implementar `src/ui/features/register/RegisterScreen.tsx`: `<AuthLayout brand={<BrandPanel variant="register" title={<>Comienza tu<br />camino financiero.</>} description="Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar." />}><RegisterForm … /></AuthLayout>`; los textos exactos están en `contracts/ui-registro.md`
- [X] T034 [US1] Modificar `src/ui/features/login/LoginForm.tsx`: nueva prop opcional `successMessage?: string` y, si existe, renderizar `<Alert tone="success">{successMessage}</Alert>` como primer elemento del formulario. No alterar ningún otro comportamiento. Hacer pasar T028
- [X] T035 [US1] Modificar `src/App.tsx`: `App({ authenticate, register })` envuelve en `NavigationProvider` y renderiza según `useNavigation().path`: `/login` → `LoginScreen` + `LoginForm` con `successMessage={flash === 'registered' ? MESSAGES.REGISTER_SUCCESS : undefined}`; `/registro` → `RegisterScreen` con `onRegistered={() => navigate(ROUTES.login, { flash: 'registered' })}`. Hacer pasar T029
- [X] T036 [US1] Modificar `src/main.tsx` (raíz de composición): crear `createRegister(new SimulatedRegistrationGateway())` y pasarlo a `<App authenticate={…} register={…} />`; es el único archivo que importa la infraestructura (Constitución 2.5). Cambiar el `<title>` de `index.html` a «KynWallet» (el título por ruta lo fija el enrutador). Actualizar las pruebas existentes que rendericen `<App>` para pasar `register` (usar `createRegisterStub`)
- [X] T037 [US1] Checkpoint de US1: ejecutar `npm run lint && npm run typecheck && npm run test` y verificar a mano en `npm run dev` los pasos 8–9 del quickstart

**Checkpoint**: US1 funcional y testeable por sí sola (MVP): registro simulado con redirección y aviso de éxito.

---

## Phase 4: User Story 2 - Validar todos los campos antes de enviar (Priority: P1)

**Goal**: «Crear cuenta» valida todos los campos y la casilla, muestra todos los errores a la vez y enfoca el primero.

**Independent Test**: pulsar «Crear cuenta» con el formulario vacío y comprobar los cinco mensajes y el foco; corregir cada campo y comprobar que su mensaje desaparece.

### Tests for User Story 2 ⚠️

- [X] T038 [P] [US2] Ampliar `registerReducer.test.ts` (verlo fallar). Casos: **FR-010** `submit` con formulario vacío marca todos los campos como tocados, `submitAttempted: true` y `fieldErrors` con los cinco mensajes, sin pasar a `submitting`; **US2-2** `change` en un campo con error lo recalcula y lo oculta si ya es válido; un campo no tocado no muestra error al cambiar; **US2-5** el error de términos se muestra tras `submit` y desaparece al marcar la casilla; **US2-3** nombre de solo espacios se trata como vacío
- [X] T039 [P] [US2] Ampliar `RegisterForm.test.tsx` (verlo fallar). Casos: **US2-1/T-UI-02** formulario vacío + «Crear cuenta» muestra los cinco mensajes («Ingresa tu nombre completo», «Ingresa tu correo electrónico», «Ingresa tu contraseña», «Confirma tu contraseña», «Debes aceptar los términos y condiciones»), no llama a `register` y el foco queda en «Nombre completo»; **foco** con el nombre válido y el resto vacío el foco va al correo; con todo válido salvo términos el foco va a la casilla; **US2-4** nombre de 101 caracteres → «El nombre no puede superar 100 caracteres»; **US2-6** cada campo con error tiene `aria-invalid="true"` y `aria-describedby` hacia su mensaje (incluida la casilla); **US2-2** corregir un campo hace desaparecer su mensaje

### Implementation for User Story 2

- [X] T040 [US2] Completar `registerReducer.ts`: acciones `blur` (marca tocado y recalcula), cálculo de errores visibles (solo campos tocados; `acceptedTerms` visible solo si `submitAttempted`), `submit` que marca todos y devuelve los errores visibles, `change` que recalcula los campos tocados. Hacer pasar T038
- [X] T041 [US2] Completar `useRegisterForm.ts` (`submit()` devuelve los `RegistrationErrors` para que la vista gestione el foco, como `useLoginForm`) y `RegisterForm.tsx`: refs a los cuatro campos y a la casilla, `error={state.fieldErrors.<campo>}` en cada uno, `onBlur` en los campos de texto, `onChange` de la casilla vía `toggleTerms`, y foco al primer error en el orden nombre → correo → contraseña → confirmación → términos. Hacer pasar T039

**Checkpoint**: US1 y US2 funcionan; el formulario nunca llama al registro con datos inválidos.

---

## Phase 5: User Story 3 - Validación inline del correo electrónico (Priority: P1)

**Goal**: el formato del correo se valida al salir del campo, sin enviar, y se reevalúa mientras se corrige.

**Independent Test**: escribir `usuario@`, salir del campo y ver el mensaje sin enviar; corregirlo y ver que desaparece al escribir.

### Tests for User Story 3 ⚠️

- [X] T042 [P] [US3] Ampliar `RegisterForm.test.tsx` (verlo fallar si algo falta). Casos: **US3-1** para `usuario@`, `usuario.com` y `a@b`, al hacer `tab` fuera del campo aparece «Ingresa un correo electrónico válido» sin llamar a `register`; **US3-2** corregirlo a `ana@example.test` hace desaparecer el mensaje mientras se escribe, sin salir del campo; **US3-3** `  Ana@Example.TEST  ` no muestra error y `register` recibe el correo normalizado; **US3-4** correo de 255 caracteres → «Ingresa un correo electrónico válido»; **US3-5** salir del campo vacío sin haber escrito → «Ingresa tu correo electrónico»; **US3-1** mientras el correo no se ha tocado no aparece ningún error al escribir las primeras letras
- [X] T043 [P] [US3] Ampliar `registerReducer.test.ts`: `blur` de `email` con `'usuario@'` produce `fieldErrors.email === 'Ingresa un correo electrónico válido'` y no afecta a los demás campos

### Implementation for User Story 3

- [X] T044 [US3] Ejecutar T042–T043; si alguno falla, ajustar `registerReducer.ts` / `RegisterForm.tsx` hasta que pasen (la lógica de `blur` ya existe por US2, por lo que en el caso esperado esta historia solo añade cobertura y verifica FR-005). No duplicar la regla de correo: debe seguir saliendo de `isValidEmail` (Constitución 4.1)

**Checkpoint**: US1–US3 verdes e independientes.

---

## Phase 6: User Story 4 - Contraseña segura y coincidente (Priority: P1)

**Goal**: la contraseña cumple 8–128 caracteres, la confirmación coincide, y cada campo de contraseña muestra u oculta su texto de forma independiente.

**Independent Test**: contraseña de 7 caracteres → mensaje; contraseña de 8 con confirmación distinta → mensaje; igualarlas → desaparece; alternar cada ojo por separado.

### Tests for User Story 4 ⚠️

- [X] T045 [P] [US4] Ampliar `registerReducer.test.ts` (verlo fallar). Casos: **US4-1** `blur` de `password` con 7 caracteres → `PASSWORD_TOO_SHORT`; **US4-2** 129 caracteres → `PASSWORD_TOO_LONG`; **US4-3** contraseña válida y confirmación distinta tocada → `PASSWORD_MISMATCH` en `confirmPassword`; **US4-4** si la confirmación ya fue tocada, cambiar `password` hasta igualarla borra `PASSWORD_MISMATCH`, y cambiar `password` para diferenciarla lo crea; **US4-5** los espacios finales cuentan en la comparación
- [X] T046 [P] [US4] Ampliar `RegisterForm.test.tsx` (verlo fallar). Casos: **US4-1/T-UI-04** 7 caracteres al salir del campo → «La contraseña debe tener al menos 8 caracteres» y no llama a `register` al enviar; **US4-3** «Las contraseñas no coinciden» junto a «Confirmar contraseña» (`aria-describedby` correcto); **US4-4** igualar las contraseñas oculta el mensaje, también cuando se corrige el primer campo y no la confirmación; **US4-6/T-UI-05** con dos botones «Mostrar contraseña», activar el primero cambia solo el tipo de su input a `text` y su nombre pasa a «Ocultar contraseña», sin afectar al segundo

### Implementation for User Story 4

- [X] T047 [US4] Completar en `registerReducer.ts` el recálculo cruzado: al cambiar `password` o `confirmPassword`, recalcular los errores de ambos campos tocados con `validateRegistration` (la regla de coincidencia ya vive en el dominio, no se reimplementa). Hacer pasar T045
- [X] T048 [US4] Verificar en `RegisterForm.tsx` que los dos `PasswordField` son instancias independientes (cada una con su estado interno de visibilidad, sin estado compartido) y que `confirmPassword` muestra su error; ajustar solo si T046 falla. Hacer pasar T046

**Checkpoint**: las cuatro historias P1 verdes; todas las reglas de FR-004 a FR-010 cubiertas.

---

## Phase 7: User Story 5 - Ir a iniciar sesión (Priority: P2)

**Goal**: navegar entre registro y login con enlaces reales y coherentes.

**Independent Test**: en `/registro` activar «Inicia sesión» y llegar a `/login` sin aviso ni datos; en `/login` activar «Regístrate» y llegar a `/registro`.

### Tests for User Story 5 ⚠️

- [X] T049 [P] [US5] Escribir `src/ui/components/Link/Link.test.tsx` (nuevo; verlo fallar; usa `renderWithNavigation`). Casos: renderiza `<a>` con el `href` de la ruta y rol `link`; un clic simple llama a `navigate` y cancela la navegación del navegador; clic con Ctrl, Meta, Shift o botón central NO llama a `navigate` (deja el comportamiento nativo); **US5-3** es alcanzable con Tab y se activa con Enter
- [X] T050 [P] [US5] Ampliar `RegisterForm.test.tsx` (verlo fallar): **US5-1** el pie contiene el enlace «Inicia sesión» con `href="/login"`; **US5-2** con datos parcialmente escritos, activar el enlace no conserva esos datos al volver a `/registro` (desmontar/montar)
- [X] T051 [P] [US5] Actualizar `src/ui/features/login/LoginForm.test.tsx` (verlo fallar): la prueba existente de «Regístrate» (que verificaba el aviso «Función no disponible en esta demostración») pasa a verificar que «Regístrate» es un enlace con `href="/registro"` (**N5**); «¿Olvidaste tu contraseña?», Google y Apple siguen mostrando el aviso actual; adaptar el `render` de este archivo a `renderWithNavigation`
- [X] T052 [P] [US5] Ampliar `src/App.test.tsx` (verlo fallar): **N4/US5-1** en `/registro`, clic en «Inicia sesión» → `/login`, sin aviso de éxito; **N5** en `/login`, clic en «Regístrate» → `/registro`; **N3** el botón «Atrás» (`history.back()` + `popstate`) restaura la pantalla anterior

### Implementation for User Story 5

- [X] T053 [US5] Implementar `src/ui/components/Link/Link.tsx` y `Link.module.css`: `Link({ to: Route, children })` que renderiza `<a href={to}>` y en `onClick` llama a `navigate(to)` con `preventDefault` solo si no hay teclas modificadoras ni botón distinto del principal; estilo idéntico al de `Button variant="link"` (`--brand-700`, 14 px, subrayado al pasar el cursor). Hacer pasar T049
- [X] T054 [US5] Modificar `RegisterForm.tsx`: pie «¿Ya tienes cuenta?» seguido de `<Link to={ROUTES.login}>Inicia sesión</Link>`, centrado con el estilo del pie del frame (14 px, `--neutral-600`). Hacer pasar T050
- [X] T055 [US5] Modificar `src/ui/features/login/LoginForm.tsx`: sustituir el `Button variant="link"` de «Regístrate» (hoy `notAvailable`) por `<Link to={ROUTES.register}>Regístrate</Link>`; no tocar el resto de manejadores. Hacer pasar T051 y T052 y confirmar que todas las demás pruebas de login siguen verdes

**Checkpoint**: la navegación entre pantallas funciona con teclado, enlaces nativos e historial coherente.

---

## Phase 8: User Story 7 - Diseño responsive (Priority: P2)

**Goal**: dos paneles en escritorio y únicamente el formulario en móvil.

**Independent Test**: a 1440 px se ven los dos paneles; a 375 px solo el formulario, sin scroll horizontal (quickstart sección 3).

### Tests for User Story 7 ⚠️

- [X] T056 [P] [US7] Ampliar `BrandPanel.test.tsx` y `AuthLayout.test.tsx` (verlos fallar): `BrandPanel` con `hideOnMobile` expone `data-hide-on-mobile="true"` y sin la prop no lo expone (el login conserva su franja de logo en móvil); `AuthLayout` propaga `hideOnMobile` al panel de marca recibido por `brand` o lo recibe como prop y lo aplica a su contenedor (elegir una sola vía y documentarla en el comentario del componente)
- [X] T057 [P] [US7] Ampliar `src/ui/features/register/RegisterForm.test.tsx` o crear `RegisterScreen.test.tsx` (verlo fallar): **T-RSP-01** `RegisterScreen` renderiza el panel de marca con `data-variant="register"` y `data-hide-on-mobile="true"`, y el formulario siempre; `LoginScreen` no marca `data-hide-on-mobile`

### Implementation for User Story 7

- [X] T058 [US7] Implementar `hideOnMobile` en `BrandPanel.tsx` / `BrandPanel.module.css`: por debajo de 768 px el panel con `data-hide-on-mobile="true"` no se muestra (`display: none`); entre 768 y 959 px conserva la franja con el logo; desde 960 px y desde 1280 px mantiene las reglas actuales (dos paneles, 620 px fijos). Pasar la prop desde `RegisterScreen.tsx` (y desde `AuthLayout` si se eligió esa vía). Hacer pasar T056 y T057
- [X] T059 [US7] Ajustar `RegisterForm.module.css` y `AuthLayout.module.css` para móvil: padding de 16 px en < 480 px, columna de 400 px máximo, botones Google/Apple en rejilla de 2 columnas desde 320 px (cada uno ≥ 130 px) con 16 px de hueco como en el frame, sin desbordamiento horizontal. Sin colores fijos
- [X] T060 [US7] Verificación manual responsive (evidencia de T-RSP-01) con DevTools a 320, 375, 768, 1024 y 1440 px siguiendo `quickstart.md` sección 3: confirmar que no hay scroll horizontal, qué se muestra en cada ancho y que el login conserva su franja de logo en móvil; registrar el resultado en la descripción del PR

**Checkpoint**: comportamiento responsive verificado en los cinco anchos.

---

## Phase 9: User Story 6 - Registro con Google o Apple no disponible (Priority: P3)

**Goal**: los botones Google y Apple (y el enlace de términos) informan «Próximamente» sin acumular alertas.

**Independent Test**: activar Google y luego Apple y comprobar un único aviso «Próximamente».

### Tests for User Story 6 ⚠️

- [X] T061 [P] [US6] Ampliar `registerReducer.test.ts` (verlo fallar): `showNotice` guarda el mensaje y reemplaza el anterior (no acumula); `submit` válido limpia `notice`; `change` no lo borra
- [X] T062 [P] [US6] Ampliar `RegisterForm.test.tsx` (verlo fallar). Casos: **US6-1** clic en «Google» muestra un elemento `role="status"` con «Próximamente», sin llamar a `register`, sin navegar y sin modificar los valores escritos; **US6-2** igual con «Apple»; **US6-3/T-UI-07** activar Google y después Apple deja un único aviso visible; **FR-015** el botón «términos y condiciones» (dentro del `Checkbox`) muestra el mismo aviso y NO marca ni desmarca la casilla

### Implementation for User Story 6

- [X] T063 [US6] Completar `registerReducer.ts` con la acción `showNotice` y su limpieza en `submit`; exponer `showNotice` desde `useRegisterForm.ts`. Hacer pasar T061
- [X] T064 [US6] Modificar `RegisterForm.tsx`: `onClick` de `SocialButton` Google y Apple → `showNotice(MESSAGES.COMING_SOON)`; el contenido de la etiqueta del `Checkbox` pasa a «Acepto los » + `<Button variant="link" onClick={…}>términos y condiciones</Button>` con el mismo aviso; renderizar `{state.notice && <Alert tone="info">{state.notice}</Alert>}` tras los botones sociales (posición del frame). Hacer pasar T062

**Checkpoint**: las siete historias completas e independientes.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: accesibilidad global, documentación, cumplimiento y verificación visual.

- [X] T065 [P] Ampliar `src/App.test.tsx` con la auditoría `expectNoA11yViolations` (**T-A11Y-01**, FR-019/FR-020) sobre `/registro` en tres estados: vacío, con los cinco errores visibles y con el aviso «Próximamente»; y sobre `/login` con el aviso de éxito visible. Corregir cualquier violación en los componentes (no en la prueba)
- [X] T066 [P] Actualizar `README.md`: título y descripción (login **y registro**); rutas `/login` y `/registro`; sección «Registro (simulado)» que declare explícitamente que **no existe un backend de registro**, que el registro es una simulación solo-cliente sin persistencia, que la cuenta creada no puede iniciar sesión y que un adaptador real debe implementar `RegistrationGateway` (sin inventar endpoints); requisito de *fallback* a `index.html` en hosting estático; actualizar el árbol de carpetas y el enlace a `specs/002-registro-usuario/`; mover «registro» fuera de la lista de elementos fuera de alcance de login (T-DOC-01, FR-021)
- [X] T067 [P] Añadir a `specs/002-registro-usuario/` una nota de desviación de contraste en `plan.md` (sección Complexity Tracking) si el valor final de `--success-700` difiere de la propuesta, y registrar en `research.md` R8 el ratio medido
- [X] T068 Revisar el código nuevo contra la Constitución: sin `console.*`, sin contraseñas en logs/URL/`history.state`/almacenamiento (buscar con `grep -rn "localStorage\|sessionStorage\|console\." src`), sin duplicar reglas de validación ni textos fuera de `MESSAGES` (4.1), sin código muerto ni comentado (4.4), capas respetadas (ESLint) y ningún cambio en `package.json` dependencias
- [X] T069 Ejecutar `npm run verify` completo (lint, formato, tipos, cobertura ≥ 80 % sin disminuir respecto a T001, build, auditoría de dependencias y licencias, secretos). Corregir con `npm run format:write` lo que falle por formato. Un control fallido bloquea la integración (9.4)
- [ ] T070 Recorrer `quickstart.md` secciones 2 a 5 en `npm run dev` y marcar cada paso; en la sección 3 comparar `/registro` a 1440 px contra el frame `04 · Registro` (nodo `31:2`: medidas de research R7) y anotar en el PR las diferencias, incluidas las desviaciones de contraste aprobadas (**T-VIS-01**, SC-007)
- [X] T071 Confirmar la trazabilidad (Constitución 9.2): cada escenario T-* de la tabla de `spec.md` tiene al menos una prueba cuyo nombre empieza por su ID de historia o requisito (`grep -rn "US[1-7]-\|FR-0" src --include=*.test.*`); corregir nombres que falten

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; BLOQUEA todas las historias.
- **User Stories (Phases 3–9)**: dependen de Foundational. Se ejecutan en orden de prioridad (P1: US1 → US2 → US3 → US4; P2: US5 → US7; P3: US6).
- **Polish (Phase 10)**: depende de las historias deseadas.

### User Story Dependencies

- **US1 (P1)**: tras Foundational. Crea `registerReducer`, `useRegisterForm`, `RegisterForm`, `RegisterScreen`, el cableado de `App` y el aviso de éxito.
- **US2, US3, US4 (P1)**: extienden los archivos de US1 (`registerReducer.ts`, `useRegisterForm.ts`, `RegisterForm.tsx`) y sus pruebas; por compartir archivos NO se paralelizan entre sí. Cada una es verificable por su propia prueba de aceptación.
- **US5 (P2)**: depende de US1 (pantallas) y del `NavigationProvider`; añade `Link`, el enlace del pie y el cambio de «Regístrate».
- **US7 (P2)**: depende de Foundational (`BrandPanel`, `AuthLayout`) y de US1 (`RegisterScreen`).
- **US6 (P3)**: depende de US1; edita `RegisterForm.tsx` y el reducer.

### Within Each User Story

- Las pruebas se escriben primero y deben fallar antes de implementar (Principio I, 1.1–1.2).
- Dominio → caso de uso → adaptador → reducer/hook → componentes → integración en `App`.
- Cada historia termina con su checkpoint (pruebas verdes + `lint` + `typecheck`).

### Parallel Opportunities

- Setup: T001 y T002 en paralelo.
- Foundational: los pares prueba/implementación de archivos distintos son paralelizables entre capas: T005, T008, T010, T013, T015, T017, T019, T021, T023 y T012 no comparten archivos y pueden escribirse a la vez; cada implementación (T006, T009, T011, T014, T016, T018, T020, T022, T024) solo espera a su propia prueba.
- US1: T026, T027, T028 y T029 (cuatro archivos de prueba distintos) en paralelo; T030–T036 son secuenciales (dependen entre sí).
- US5: T049, T050, T051 y T052 en paralelo.
- US7: T056 y T057 en paralelo.
- Polish: T065, T066 y T067 en paralelo.

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Pruebas de capas distintas, escribibles a la vez (cada una debe fallar antes de implementar):
Task: "Escribir src/domain/registrationValidation.test.ts"                      # T005
Task: "Escribir src/application/register.test.ts"                               # T008
Task: "Escribir src/infrastructure/SimulatedRegistrationGateway.test.ts"        # T010
Task: "Escribir src/ui/navigation/routes.test.ts"                               # T021
Task: "Escribir src/ui/navigation/NavigationProvider.test.tsx"                  # T023
```

## Parallel Example: User Story 1

```bash
Task: "Escribir src/ui/features/register/registerReducer.test.ts"               # T026
Task: "Escribir src/ui/features/register/RegisterForm.test.tsx"                 # T027
Task: "Ampliar src/ui/features/login/LoginForm.test.tsx (successMessage)"       # T028
Task: "Ampliar src/App.test.tsx (flujo registro → login)"                       # T029
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 (base verde) y Phase 2 (Foundational).
2. Completar Phase 3 (US1) siguiendo rojo → verde → refactor.
3. **STOP y VALIDAR**: `npm run test`, `lint`, `typecheck` y quickstart pasos 8–9.
4. Demo: registro simulado con redirección y aviso de éxito.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → MVP demostrable.
3. US2 → US3 → US4: validación completa (las cuatro P1 cubren FR-003 a FR-010).
4. US5 → navegación completa; US7 → responsive; US6 → avisos «Próximamente».
5. Polish: accesibilidad global, README, `verify`, comparación con Figma.

### Notas

- **Registro simulado**: no existe backend. Ninguna tarea define endpoints ni persistencia; el
  adaptador real se sustituye únicamente en `src/main.tsx` (plan.md, «Tratamiento del registro
  exitoso»).
- **Decisiones a confirmar antes de implementar** (plan.md, «Riesgos y puntos abiertos»): la
  cuenta registrada no puede iniciar sesión; «Próximamente» como aviso en pantalla y no como
  `window.alert()`; enrutador propio en lugar de `react-router`.
- **Duplicación aceptada**: `registerReducer`/`useRegisterForm` replican el patrón de login por
  decisión de alcance (no se refactoriza el login existente); extraer un hook común queda como
  mejora futura.
- Commit tras cada par prueba/implementación; no integrar con pruebas fallando (1.4).

## Registro de implementación (2026-10-16)

- **Pendientes manuales (no ejecutables sin navegador en esta sesión)**: T060 (responsive a 320, 375,
  768, 1024 y 1440 px) y T070 (recorrido del quickstart y comparación con el frame `04 · Registro`).
  Verificado por curl sobre `vite preview`: `/registro`, `/login`, `/` y `/xyz` devuelven `index.html`.
- **Desviación en T015/T016**: `Checkbox` mantiene `label: string` y añade `labelSuffix?: ReactNode`
  (en vez de `label: ReactNode`). Así el `<label>` nunca contiene un botón (HTML válido) y el nombre
  accesible sigue siendo «Acepto los términos y condiciones» mediante `aria-labelledby`.
- **Desviación en T026/T030**: la acción del reducer para el fallo es `{ type: 'failed' }` (no
  `result`); el éxito no pasa por el reducer, el hook invoca `onRegistered()`.
- **T056 (decisión de T1 del análisis)**: `hideOnMobile` es una prop de `BrandPanel`; `AuthLayout`
  solo recibe `brand` y no la conoce.
- **T025**: se hizo antes de las pruebas de navegación (hallazgo T2 del análisis).
- **TDD**: las pruebas de US3 y US4 pasaron en la primera ejecución porque la lógica de `blur` y el
  recálculo cruzado ya existían por US2 y por el dominio; se añadieron como cobertura de esos escenarios.
- **Código eliminado**: `isValidFullName` (exportado sin uso) para no integrar código muerto (4.4).
- **Cobertura**: base 98.88 % sentencias / 97.58 % ramas → final 99.18 % / 98.35 %. Quedan sin cubrir
  por UI las guardas `inFlight` de `useRegisterForm` y `useLoginForm` (el botón deshabilitado impide
  el segundo envío; la guarda es defensa en profundidad).
- **Decisiones de producto aún sin confirmar** (se implementó el valor por defecto del plan): la cuenta
  registrada no puede iniciar sesión; «Próximamente» como aviso en pantalla; enrutador propio.

### Revisión posterior (2026-10-16)

- **T060 hecha**: se midió con Chrome headless (CDP, viewport emulado) a 320, 375, 414, 767, 768, 959, 960,
  1024, 1279, 1280 y 1440 px, en `/registro` y `/login`: sin desplazamiento horizontal en ningún ancho; el
  panel de marca de registro se oculta por debajo de 768 px y el de login conserva su franja.
- **T070 parcial**: la comparación con Figma a 1440 px se hizo midiendo posiciones (coinciden con el frame
  a ±2 px) y con capturas. Siguen sin ejecutarse a mano los pasos del quickstart con lector de pantalla
  (sección 4) y la navegación manual en `npm run dev` (sección 2); esos comportamientos solo están
  cubiertos por pruebas automáticas.
