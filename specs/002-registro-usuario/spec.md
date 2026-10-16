# Feature Specification: Pantalla de Registro de Usuarios de KynWallet

**Feature Branch**: `002-registro-usuario`

**Created**: 2026-10-16

**Status**: Draft

**Input**: User description: "Implementar la pantalla de Registro de Usuarios de KynWallet. Campos
obligatorios: nombre completo, correo electrónico, contraseña y confirmar contraseña. Checkbox
obligatorio de términos y condiciones. Botón «Crear cuenta» que valide todos los campos antes de
enviar. Validación inline del formato del correo. Contraseña de mínimo 8 caracteres. Validación de
coincidencia de contraseñas. Botones de Google y Apple que muestren una alerta con el mensaje
«Próximamente». Enlace «¿Ya tienes cuenta? Inicia sesión» que navegue a /login. Al terminar el
registro correctamente, redirigir a /login y mostrar un mensaje de éxito. Diseño responsive: dos
paneles en desktop y únicamente el formulario en mobile. Fidelidad al frame «04 · Registro» de
Figma, cumplimiento de la constitución y convenciones existentes, reutilización de componentes y
pruebas para requisitos funcionales y validaciones. No inventar endpoints ni simular un registro
real sin documentarlo."

**Diseño de referencia**: Figma, frame `04 · Registro` (nodo `31:2`), 1440 × 1024. Leído
directamente con el MCP de Figma desde la copia `onwn9nLuHU8DzpFUOpZNRv` (el archivo original
`f7uDsv8sh6ZOtK2OitTqtg` no fue accesible para la cuenta conectada). Compuesto por:

- **Panel de marca** (620 px, degradado naranja): logo KynWallet, titular «Comienza tu camino
  financiero.», texto de apoyo «Crea tu cuenta en minutos y empieza a enviar, recibir y
  administrar tu dinero desde cualquier lugar.» y tarjeta ilustrativa «Kyn Card».
- **Panel de formulario**: título «Crea tu cuenta», subtítulo «Completa tus datos para comenzar»,
  campos «Nombre completo», «Correo electrónico», «Contraseña» y «Confirmar contraseña» (ambas con
  control de visibilidad), casilla «Acepto los términos y condiciones», botón «Crear cuenta»,
  separador «o regístrate con», botones «Google» y «Apple» y el pie «¿Ya tienes cuenta? Inicia
  sesión».

El detalle de medidas, colores y tipografía extraído de Figma se documentará en la fase de plan
(research/contratos de UI) y es la referencia de fidelidad visual de FR-001.

## Hallazgos de la inspección del proyecto

Antes de especificar se inspeccionó el repositorio (rama `feature/registro-jose-rojas`). Estos
hechos condicionan el alcance y NO se asumen ni se inventan:

| Aspecto inspeccionado | Hallazgo |
|---|---|
| Backend / endpoint de registro | **No existe.** No hay llamadas de red (`fetch`, `axios`, XHR), ni rutas `/api`, ni cliente HTTP, ni documentación de un servicio de registro. |
| Persistencia | **No existe.** No se usa `localStorage`, `sessionStorage` ni base de datos. La spec 001 es solo-cliente, con cuentas ficticias en memoria. |
| Puerto de autenticación | Existe `AuthGateway` (solo `authenticate`) con implementación `InMemoryAuthGateway`. No existe un puerto de registro. |
| Enrutamiento / ruta `/login` | **No existe.** La aplicación es de una sola pantalla (`App` muestra el login) y no tiene router; la spec 001 descarta explícitamente un router (YAGNI). La ruta `/login` y la navegación entre pantallas deben crearse como parte de esta funcionalidad. |
| Reutilización | Existen componentes de UI reutilizables: `TextField`, `PasswordField`, `Button`, `Checkbox`, `SocialButton`, `Divider`, `Alert`, `BrandPanel`, además de reglas de validación y textos en `domain/`. |
| Tokens de diseño | Existen en `ui/styles/tokens.css`, con desviaciones de contraste aprobadas pendientes (spec 001, Complexity Tracking). |

**Consecuencia**: el registro de esta funcionalidad es una **simulación solo-cliente**. NO se
envía información a ningún servicio ni se crea una cuenta real. Esta limitación debe quedar
visible en la documentación del proyecto (FR-021) y no debe presentarse al usuario final como un
alta real más allá del mensaje de éxito exigido por el requerimiento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una cuenta con datos válidos (Priority: P1)

Como persona nueva en KynWallet, quiero completar el formulario de registro y crear mi cuenta,
para empezar a usar la billetera.

**Why this priority**: es el propósito central de la pantalla; sin este flujo no existe valor
demostrable.

**Independent Test**: se completan los cuatro campos con datos válidos, se marca la casilla de
términos, se presiona «Crear cuenta» y se verifica la redirección a `/login` con el mensaje de
éxito.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro, **When** la persona ingresa nombre, correo válido,
   contraseña de al menos 8 caracteres, la misma contraseña en la confirmación, marca los
   términos y presiona «Crear cuenta», **Then** el sistema procesa el registro y redirige a
   `/login`.
2. **Given** el registro se completó correctamente, **When** se muestra `/login`, **Then** se
   presenta un mensaje de éxito visible (p. ej. «Cuenta creada correctamente. Ya puedes iniciar
   sesión») anunciado a tecnologías de asistencia.
3. **Given** el formulario válido fue enviado, **When** el registro está en curso, **Then** el
   botón «Crear cuenta» muestra estado de carga, queda deshabilitado y no admite envíos
   adicionales.
4. **Given** la persona está en cualquier campo de texto, **When** presiona Enter con el
   formulario válido, **Then** el formulario se envía igual que al presionar «Crear cuenta».
5. **Given** el mensaje de éxito en `/login`, **When** la persona recarga la página o navega a
   otra pantalla y regresa, **Then** el mensaje de éxito ya no se muestra.

---

### User Story 2 - Validar todos los campos antes de enviar (Priority: P1)

Como persona que se registra, quiero que el formulario me indique qué datos faltan o son
incorrectos antes de crear la cuenta, para corregirlos rápidamente.

**Why this priority**: el requerimiento exige que «Crear cuenta» valide todos los campos antes de
enviar; evita registros inválidos y es indispensable junto con la historia 1.

**Independent Test**: se presiona «Crear cuenta» con el formulario vacío y se verifican los cinco
mensajes; luego se corrige cada campo y se verifica que cada mensaje desaparece.

**Acceptance Scenarios**:

1. **Given** el formulario vacío, **When** se presiona «Crear cuenta», **Then** se muestran
   mensajes junto a cada campo obligatorio («Ingresa tu nombre completo», «Ingresa tu correo
   electrónico», «Ingresa tu contraseña», «Confirma tu contraseña») y junto a la casilla
   («Debes aceptar los términos y condiciones»), no se ejecuta el registro y el foco se mueve al
   primer campo con error.
2. **Given** un campo con mensaje de error, **When** la persona corrige el valor, **Then** el
   mensaje de ese campo desaparece.
3. **Given** un nombre compuesto solo por espacios, **When** se envía el formulario, **Then** se
   trata como vacío y se muestra «Ingresa tu nombre completo».
4. **Given** un nombre de más de 100 caracteres, **When** se envía el formulario, **Then** se
   muestra «El nombre no puede superar 100 caracteres».
5. **Given** la casilla de términos sin marcar y el resto de campos válidos, **When** se presiona
   «Crear cuenta», **Then** se muestra «Debes aceptar los términos y condiciones» y no se ejecuta
   el registro.
6. **Given** un campo con error, **When** es leído por un lector de pantalla, **Then** se anuncia
   el mensaje de error asociado a ese campo.

---

### User Story 3 - Validación inline del correo electrónico (Priority: P1)

Como persona que se registra, quiero saber de inmediato si el correo tiene un formato incorrecto,
para no descubrirlo hasta el final.

**Why this priority**: es un requisito funcional explícito; reduce errores de captura.

**Independent Test**: se escribe un correo mal formado, se sale del campo y se verifica el mensaje
sin necesidad de enviar el formulario.

**Acceptance Scenarios**:

1. **Given** un correo con formato inválido («usuario@», «usuario.com», «a@b»), **When** la
   persona sale del campo, **Then** se muestra «Ingresa un correo electrónico válido» sin enviar
   el formulario.
2. **Given** un correo con mensaje de formato inválido, **When** la persona lo corrige a un valor
   válido, **Then** el mensaje desaparece mientras escribe.
3. **Given** un correo válido con mayúsculas o espacios al inicio o al final, **When** se valida,
   **Then** se acepta (los espacios periféricos se ignoran).
4. **Given** un correo de más de 254 caracteres, **When** se valida, **Then** se muestra
   «Ingresa un correo electrónico válido».
5. **Given** el campo de correo vacío al salir de él sin haber escrito, **When** se pierde el
   foco, **Then** se muestra el mensaje de campo obligatorio.

---

### User Story 4 - Contraseña segura y coincidente (Priority: P1)

Como persona que se registra, quiero que se verifique que mi contraseña cumple el mínimo y que la
confirmé correctamente, para no quedar con una contraseña que no conozco.

**Why this priority**: son reglas de validación explícitas del requerimiento y protegen a la
persona usuaria de errores de captura.

**Independent Test**: se ingresa una contraseña de 7 caracteres y luego una de 8 con confirmación
distinta; se verifican ambos mensajes y se corrigen.

**Acceptance Scenarios**:

1. **Given** una contraseña de menos de 8 caracteres, **When** se valida (al salir del campo o al
   enviar), **Then** se muestra «La contraseña debe tener al menos 8 caracteres» y no se ejecuta el
   registro.
2. **Given** una contraseña de más de 128 caracteres, **When** se valida, **Then** se muestra «La
   contraseña no puede superar 128 caracteres».
3. **Given** una contraseña válida y una confirmación distinta, **When** se valida, **Then** se
   muestra «Las contraseñas no coinciden» junto al campo de confirmación.
4. **Given** el mensaje «Las contraseñas no coinciden», **When** la persona modifica cualquiera de
   las dos contraseñas hasta que coincidan, **Then** el mensaje desaparece.
5. **Given** una contraseña con espacios, **When** se valida, **Then** los espacios se respetan
   sin recortarse (se compara y se cuenta tal cual).
6. **Given** un campo de contraseña oculto, **When** la persona activa su control de visibilidad
   (en «Contraseña» o en «Confirmar contraseña»), **Then** el texto se muestra o se oculta de forma
   independiente por campo y el control indica «Mostrar contraseña» / «Ocultar contraseña» a
   tecnologías de asistencia.

---

### User Story 5 - Ir a iniciar sesión (Priority: P2)

Como persona que ya tiene cuenta, quiero ir al inicio de sesión desde el registro, para no
registrarme de nuevo.

**Why this priority**: navegación explícita del diseño y requerimiento; el registro es
demostrable sin ella.

**Independent Test**: se activa «Inicia sesión» y se verifica que se muestra la pantalla de login
en `/login`.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro, **When** la persona activa el enlace «Inicia sesión» del pie
   «¿Ya tienes cuenta? Inicia sesión», **Then** el sistema navega a `/login` y muestra la pantalla
   de inicio de sesión sin mensaje de éxito.
2. **Given** datos parcialmente ingresados en el formulario, **When** la persona navega a
   `/login`, **Then** los datos del formulario de registro no se conservan.
3. **Given** el enlace «Inicia sesión», **When** se opera solo con teclado, **Then** puede
   alcanzarse y activarse y es anunciado como enlace.

---

### User Story 6 - Registro con Google o Apple no disponible (Priority: P3)

Como persona que ve las opciones de Google y Apple, quiero saber que aún no están disponibles,
para no quedar con la impresión de un error.

**Why this priority**: mantiene la fidelidad al diseño sin ampliar el alcance funcional.

**Independent Test**: se activa cada botón y se verifica la alerta «Próximamente».

**Acceptance Scenarios**:

1. **Given** la pantalla de registro, **When** la persona activa el botón «Google», **Then** se
   muestra una alerta con el mensaje «Próximamente», anunciada a tecnologías de asistencia, sin
   navegar ni modificar los datos ingresados.
2. **Given** la pantalla de registro, **When** la persona activa el botón «Apple», **Then** se
   muestra la misma alerta «Próximamente» con el mismo comportamiento.
3. **Given** una alerta «Próximamente» visible, **When** la persona activa el otro botón (o el
   enlace «términos y condiciones»), **Then** no se acumulan alertas duplicadas.

---

### User Story 7 - Diseño responsive (Priority: P2)

Como persona que usa un teléfono, quiero ver únicamente el formulario de registro de forma
cómoda, y como persona en escritorio quiero ver los dos paneles del diseño.

**Why this priority**: requisito explícito; cubre el uso en dispositivos móviles.

**Independent Test**: se verifica la pantalla en 1440 px (dos paneles) y en 375 px (solo
formulario, sin desplazamiento horizontal).

**Acceptance Scenarios**:

1. **Given** una ventana de escritorio (≥ 1024 px), **When** se muestra el registro, **Then** se
   ven el panel de marca y el panel de formulario lado a lado según el diseño.
2. **Given** un ancho móvil (< 768 px), **When** se muestra el registro, **Then** el panel de
   marca no se muestra y solo se ve el formulario, utilizable completo y sin desplazamiento
   horizontal desde 320 px.
3. **Given** anchos intermedios (768–1023 px), **When** se muestra el registro, **Then** la
   pantalla sigue siendo utilizable sin superposición ni desplazamiento horizontal (el
   comportamiento exacto se define en el plan a partir de los dos extremos del requerimiento).

---

### Edge Cases

- Envíos repetidos de «Crear cuenta»: solo se procesa un intento.
- Pegado de texto en los campos: se acepta y se valida igual que el texto escrito.
- La confirmación se completa antes que la contraseña: la coincidencia se reevalúa al cambiar
  cualquiera de los dos campos.
- Fallo inesperado del proceso de registro: se muestra un mensaje comprensible («No pudimos crear
  tu cuenta. Intenta más tarde.») sin detalles técnicos, el formulario conserva nombre y correo,
  se vacían las contraseñas y el botón vuelve a habilitarse.
- Acceso directo a `/login` o a la ruta de registro por URL, recarga o botón atrás del navegador:
  muestra la pantalla correspondiente.
- Una ruta desconocida: muestra una pantalla por defecto definida en el plan (se propone la de
  inicio de sesión); no queda en blanco.
- Nombre con acentos, ñ, apóstrofes o guiones (p. ej. «María José O'Neil-Peña»): se acepta.
- Pulsar «Crear cuenta» con la casilla de términos marcada y el resto vacío: solo se muestran los
  errores de los campos vacíos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La pantalla DEBE reproducir la estructura, textos y jerarquía visual del frame
  `04 · Registro` de Figma, con sus dos paneles en escritorio, aplicando los tokens y componentes
  del sistema de diseño existentes y documentando toda desviación (p. ej. contraste) según la
  Constitución 8.4 y 8.6.
- **FR-002**: El formulario DEBE incluir los campos obligatorios «Nombre completo», «Correo
  electrónico», «Contraseña» y «Confirmar contraseña», cada uno con etiqueta visible asociada.
- **FR-003**: El formulario DEBE incluir la casilla obligatoria «Acepto los términos y
  condiciones» y el sistema NO DEBE registrar mientras no esté marcada.
- **FR-004**: El campo «Nombre completo» DEBE ser obligatorio, ignorar espacios periféricos y
  tener un máximo de 100 caracteres.
- **FR-005**: El campo «Correo electrónico» DEBE ser obligatorio, tener formato de correo válido
  y no exceder 254 caracteres; el formato DEBE validarse de forma inline al salir del campo y
  reevaluarse mientras se corrige. La regla DEBE reutilizar la misma fuente de validación de
  correo ya existente (Constitución 4.1).
- **FR-006**: El campo «Contraseña» DEBE ser obligatorio y tener entre 8 y 128 caracteres, sin
  recortar espacios, reutilizando las reglas y los límites ya definidos.
- **FR-007**: El campo «Confirmar contraseña» DEBE ser obligatorio y coincidir exactamente con
  «Contraseña»; la coincidencia DEBE reevaluarse al modificar cualquiera de los dos campos.
- **FR-008**: Ambos campos de contraseña DEBEN ocultar los caracteres por defecto y ofrecer, cada
  uno, un control accesible e independiente para mostrarlos u ocultarlos.
- **FR-009**: El botón «Crear cuenta» DEBE validar todos los campos y la casilla antes de enviar;
  si hay errores NO DEBE ejecutar el registro, DEBE mostrar todos los mensajes a la vez y mover
  el foco al primer campo con error.
- **FR-010**: Los mensajes de validación DEBEN mostrarse junto al campo correspondiente, DEBEN
  ocultarse al corregir el valor y DEBEN anunciarse a tecnologías de asistencia asociados a su
  campo. Todos los textos DEBEN tener una única fuente (Constitución 4.1).
- **FR-011**: Con datos válidos, el sistema DEBE ejecutar el registro a través de un puerto de
  registro abstracto inyectado (Constitución 2.5, 3.4), con estado de carga y el botón
  deshabilitado durante el intento.
- **FR-012**: Cuando el registro termine correctamente, el sistema DEBE redirigir a `/login` y
  mostrar allí un mensaje de éxito visible y anunciado automáticamente; el mensaje NO DEBE
  persistir tras recargar ni tras una navegación posterior.
- **FR-013**: Ante un fallo del registro, el sistema DEBE mostrar un mensaje comprensible sin
  detalles técnicos, conservar nombre y correo, vaciar las contraseñas y rehabilitar el botón
  (Constitución 5.5).
- **FR-014**: El sistema NO DEBE registrar, mostrar ni almacenar contraseñas en mensajes,
  registros de diagnóstico, URL, parámetros de ruta, estado de navegación ni almacenamiento del
  navegador (Constitución 5.3, 5.4); el redireccionamiento a `/login` NO DEBE transportar datos
  personales.
- **FR-015**: Los botones «Google» y «Apple» y el enlace «términos y condiciones» DEBEN
  mostrarse según el diseño y, al activarse, mostrar una alerta en pantalla (anunciada a
  tecnologías de asistencia, no un diálogo nativo) con el mensaje «Próximamente», sin navegar ni
  modificar el formulario; solo hay un aviso visible a la vez. Activar el enlace de términos NO
  cambia el estado de la casilla.
- **FR-016**: El enlace «Inicia sesión» del pie DEBE navegar a `/login`.
- **FR-017**: DEBE existir la ruta `/login`, que muestre la pantalla de inicio de sesión de la
  funcionalidad 001, y la ruta de registro, con navegación coherente (acceso directo, recarga y
  botón atrás). El mecanismo de enrutamiento se decide en el plan, justificando cualquier nueva
  dependencia (Constitución 4.2, 7.4); la pantalla de login existente NO DEBE perder su
  comportamiento actual, con una única excepción deliberada: el enlace «Regístrate» pasa de
  mostrar el aviso «Función no disponible» a navegar a la ruta de registro.
- **FR-018**: En escritorio la pantalla DEBE mostrar los dos paneles; en móvil (< 768 px) DEBE
  mostrar únicamente el formulario, completamente utilizable sin desplazamiento horizontal desde
  320 px.
- **FR-019**: El formulario DEBE poder enviarse con Enter y operarse completamente con teclado,
  con orden de foco lógico y foco visible.
- **FR-020**: La pantalla DEBE cumplir WCAG 2.1 nivel AA: etiquetas asociadas, errores y alertas
  anunciados, contraste suficiente y operación por teclado (Constitución 8.4).
- **FR-021**: La documentación del proyecto (README y contratos) DEBE indicar de forma explícita
  que **no existe un backend de registro**, que el registro es una **simulación solo-cliente
  sin persistencia** y qué endpoint/contrato real tendría que sustituirla. NO DEBEN inventarse
  endpoints ni nombres de servicios.
- **FR-022**: La implementación DEBE reutilizar los componentes de UI, reglas de validación y
  textos ya existentes (`TextField`, `PasswordField`, `Checkbox`, `Button`, `SocialButton`,
  `Divider`, `Alert`, `BrandPanel`), y ampliarlos sin duplicarlos cuando el diseño lo requiera
  (Constitución 4.1, 8.5).
- **FR-023**: Todos los requisitos funcionales y validaciones DEBEN estar cubiertos por pruebas
  automatizadas escritas antes del código (Constitución 1.1) y nombradas con el ID del escenario
  o requisito que verifican (Constitución 9.2).

### Key Entities

- **Solicitud de registro**: datos ingresados en el formulario: nombre completo, correo
  electrónico, contraseña, confirmación de contraseña y aceptación de términos. Existe solo
  mientras se completa el formulario; la contraseña nunca se persiste ni se registra.
- **Resultado de registro**: éxito, error de validación o fallo inesperado. Un éxito dispara la
  navegación a `/login` con un aviso de un solo uso.
- **Aviso de éxito**: mensaje transitorio mostrado en `/login` tras un registro exitoso; no
  contiene datos personales.

## Escenarios de prueba *(trazabilidad)*

| ID | Tipo | Verifica |
|---|---|---|
| T-DOM-01 | Unitaria (dominio) | Validación de nombre: vacío, solo espacios, 100/101 caracteres, acentos y apóstrofes (FR-004) |
| T-DOM-02 | Unitaria (dominio) | Validación de correo: válido, inválido, 254/255 caracteres, espacios periféricos (FR-005) |
| T-DOM-03 | Unitaria (dominio) | Contraseña: 7/8/128/129 caracteres y espacios respetados (FR-006) |
| T-DOM-04 | Unitaria (dominio) | Coincidencia de contraseñas: iguales, distintas, diferencia de mayúsculas o espacios (FR-007) |
| T-DOM-05 | Unitaria (dominio) | Validación de formulario completo: todos los errores a la vez y términos obligatorios (FR-003, FR-009) |
| T-APP-01 | Unitaria (aplicación) | El caso de uso valida antes de llamar al puerto y no lo invoca con errores (FR-009, FR-011) |
| T-APP-02 | Unitaria (aplicación) | El puerto devuelve éxito, o error → resultado de fallo sin lanzar excepciones (FR-011, FR-013) |
| T-INF-01 | Unitaria (infraestructura) | El adaptador simulado no persiste ni registra la contraseña y documenta ser simulación (FR-014, FR-021) |
| T-UI-01 | Componente | US1: envío válido muestra carga, deshabilita el botón y redirige (FR-011, FR-012) |
| T-UI-02 | Componente | US2: formulario vacío muestra todos los mensajes y enfoca el primer error (FR-009, FR-010) |
| T-UI-03 | Componente | US3: validación inline del correo al salir del campo y al corregir (FR-005) |
| T-UI-04 | Componente | US4: mínimo de contraseña, no coincidencia y reevaluación cruzada (FR-006, FR-007) |
| T-UI-05 | Componente | US4: visibilidad independiente por campo con etiquetas accesibles (FR-008) |
| T-UI-06 | Componente | US5: «Inicia sesión» navega a `/login` (FR-016) |
| T-UI-07 | Componente | US6: «Google» y «Apple» muestran «Próximamente» sin acumular alertas (FR-015) |
| T-UI-08 | Componente | Fallo de registro: mensaje, datos conservados, contraseñas vacías (FR-013) |
| T-NAV-01 | Integración | Registro exitoso → `/login` con mensaje de éxito; el mensaje no reaparece tras recargar (FR-012, FR-017) |
| T-NAV-02 | Integración | Acceso directo a `/login` y a registro; la pantalla de login conserva su comportamiento (FR-017) |
| T-RSP-01 | Componente | Dos paneles en escritorio; solo formulario en móvil (FR-018) |
| T-A11Y-01 | Accesibilidad | Auditoría automatizada sin violaciones WCAG 2.1 AA y operación por teclado (FR-019, FR-020) |
| T-DOC-01 | Revisión | README y contratos declaran la ausencia de backend y la simulación (FR-021) |
| T-VIS-01 | Revisión visual | Comparación contra el frame de Figma: textos, orden, medidas y colores (FR-001) |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona completa el registro con datos válidos en menos de 90 segundos desde que
  la pantalla se muestra.
- **SC-002**: El resultado de un intento (redirección con éxito o mensaje de error) se muestra en
  un máximo de 2 segundos tras presionar «Crear cuenta».
- **SC-003**: El 100 % de los escenarios de aceptación de las historias P1 y P2 se verifican
  mediante pruebas automatizadas que pasan, y las reglas de validación tienen cobertura del 100 %
  de sus ramas.
- **SC-004**: Ningún envío con datos inválidos llega a ejecutar el registro (0 de los casos de
  prueba de validación llaman al puerto de registro).
- **SC-005**: La pantalla no presenta incumplimientos WCAG 2.1 AA en una auditoría automatizada y
  se completa íntegramente solo con teclado.
- **SC-006**: La pantalla funciona sin desplazamiento horizontal en anchos desde 320 px hasta
  1440 px, y muestra dos paneles en escritorio y uno en móvil.
- **SC-007**: La revisión visual frente al frame de Figma no detecta diferencias de textos, orden
  de elementos ni jerarquía; las únicas desviaciones de color son las aprobadas por contraste.
- **SC-008**: El análisis de secretos y el de dependencias no detectan hallazgos y la cobertura
  global del proyecto no disminuye (Constitución 8.1, 9.4).

## Assumptions

- **No existe backend de registro** (verificado en el repositorio). El registro se resuelve con un
  adaptador simulado solo-cliente detrás de un puerto abstracto; sustituirlo por un servicio real
  solo exige cambiar el adaptador. No se define ningún endpoint, URL de servicio ni formato de
  contrato de red hasta que exista una especificación (BRD/ARD) del servicio real.
- El registro simulado **no crea una cuenta utilizable**: no persiste datos y la cuenta recién
  «creada» no podrá iniciar sesión en la pantalla de login (que solo acepta las cuentas de
  demostración de la funcionalidad 001). El mensaje de éxito es el exigido por el requerimiento.
  **Esto debe revisarse con el responsable del producto** si se espera que el usuario registrado
  pueda ingresar.
- El registro simulado no detecta correos duplicados, ya que no existe un almacén de cuentas con
  el que compararlos.
- Los textos de los mensajes de validación y de éxito que no figuran literalmente en el
  requerimiento (por ejemplo «Ingresa tu nombre completo» o «Las contraseñas no coinciden») son
  propuestas en español, coherentes con los de la funcionalidad 001, y se centralizan en una única
  fuente de textos.
- Los términos y condiciones no tienen documento ni pantalla asociada: el texto «términos y
  condiciones» se muestra como enlace estilizado según el diseño; su destino queda fuera del
  alcance y, al activarlo, se informa «Próximamente», igual que los botones de Google y Apple.
- «Móvil» se interpreta como anchos menores de 768 px y «escritorio» como anchos de 1024 px o más;
  el diseño de Figma solo define el frame de escritorio (1440 × 1024), por lo que la versión
  móvil se deriva de él sin alterar textos ni jerarquía.
- Las ventanas de 768 a 1023 px tienen un comportamiento intermedio definido en el plan.
- Se reutilizan el idioma (español), los límites de longitud (correo 254, contraseña 8–128) y las
  desviaciones de contraste de la funcionalidad 001 pendientes de aprobación del responsable de
  diseño (Constitución 8.6).
- El mensaje de éxito en `/login` es de un solo uso y no se almacena en el navegador; el
  mecanismo para transportarlo entre pantallas se define en el plan, sin enviar datos personales
  ni contraseñas.
- No existen BRD ni ARD para esta funcionalidad; si se incorporan, esta especificación DEBE
  alinearse con ellos (Constitución, Principio VI).
- Fuera de alcance: verificación de correo, recuperación de contraseña, reglas de complejidad de
  contraseña adicionales, bloqueo por intentos, registro con Google/Apple, inicio de sesión
  automático tras el registro y persistencia de cualquier dato.
