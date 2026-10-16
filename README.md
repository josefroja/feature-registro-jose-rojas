# KynWallet · Inicio de sesión y registro (demo)

Demostración funcional, solo del lado del cliente, de la pantalla de inicio de sesión de la
billetera virtual KynWallet. Reproduce el diseño de Figma
([01 · Login](https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=2-2)),
valida los campos y simula la autenticación contra cuentas ficticias, sin backend ni base de datos.

También incluye la pantalla de registro
([04 · Registro](https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=31-2)),
con validación de campos y un registro **simulado**.

Especificación, plan y tareas: [`specs/001-login-billetera/`](specs/001-login-billetera/) y
[`specs/002-registro-usuario/`](specs/002-registro-usuario/).

## Rutas

| Ruta        | Pantalla                                                |
| ----------- | ------------------------------------------------------- |
| `/login`    | Inicio de sesión                                        |
| `/registro` | Registro de usuarios                                    |
| `/` u otras | Redirigen a `/login` (sin añadir entradas al historial) |

El enrutamiento es propio y mínimo (History API, sin dependencias). `npm run dev` y
`npm run preview` ya sirven cualquier ruta con `index.html`; en un hosting estático real hay que
configurar esa misma regla (_fallback_ de cualquier ruta a `index.html`).

## Registro (simulado)

⚠️ **No existe un backend de registro.** El registro es una simulación solo-cliente: espera un
segundo y siempre tiene éxito (`src/infrastructure/SimulatedRegistrationGateway.ts`), no envía ni
guarda ningún dato y **la cuenta «creada» no puede iniciar sesión** (el login solo acepta las
cuentas de `VITE_DEMO_USERS`). Tras «registrarse» se redirige a `/login` con un aviso de éxito de
un solo uso que vive en memoria (no en la URL, el historial ni el almacenamiento) y desaparece al
recargar.

Para conectar un servicio real, implementa el puerto `RegistrationGateway`
(`src/application/ports/RegistrationGateway.ts`, contrato en
[`specs/002-registro-usuario/contracts/registration-gateway.md`](specs/002-registro-usuario/contracts/registration-gateway.md))
y cámbialo en `src/main.tsx`. El contrato del servicio (endpoint, formato) debe venir de su
especificación; no está definido en este repositorio.

## Requisitos

- Node.js 20 LTS o superior y npm 10 o superior.

## Configuración

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y define al menos una cuenta **ficticia** en `VITE_DEMO_USERS`:

```dotenv
VITE_DEMO_USERS=[{"email":"tu.correo@example.com","password":"minimo-8-caracteres","displayName":"Tu Nombre"}]
```

- `password`: de 8 a 128 caracteres. `displayName`: de 1 a 80 caracteres. Los correos no se pueden repetir.
- `.env.local` no se versiona: la Constitución del proyecto (regla 5.3) prohíbe credenciales en el
  código fuente o en archivos versionados.
- ⚠️ Al ser una aplicación solo-cliente, el valor de `VITE_DEMO_USERS` queda incluido en el bundle
  compilado. Usa únicamente cuentas ficticias.
- Si la variable falta o es inválida, la pantalla muestra "Servicio de acceso no disponible".

## Scripts

| Comando                           | Descripción                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo en <http://localhost:5173>                                                                                                     |
| `npm run build`                   | Typecheck y build de producción en `dist/`                                                                                                            |
| `npm run preview`                 | Sirve el build de producción                                                                                                                          |
| `npm test`                        | Ejecuta las pruebas una vez                                                                                                                           |
| `npm run test:watch`              | Pruebas en modo observación                                                                                                                           |
| `npm run test:coverage`           | Pruebas con cobertura (umbral: 80 %)                                                                                                                  |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                                                                     |
| `npm run verify`                  | Todos los controles de cumplimiento: lint, formato, tipos, pruebas con cobertura, build, auditoría de dependencias y licencias, y escaneo de secretos |

## Arquitectura

Clean Architecture ligera. Las dependencias apuntan hacia el dominio y ESLint lo verifica:

```text
src/
├── domain/          # Tipos, reglas de validación y textos. Sin React.
├── application/     # Casos de uso `authenticate` y `register`; puertos `AuthGateway` y `RegistrationGateway`
├── infrastructure/  # `InMemoryAuthGateway`, `SimulatedRegistrationGateway` (simulaciones, 1 s) y `loadDemoAccounts`
├── ui/
│   ├── styles/      # Tokens de Figma (`tokens.css`) y estilos globales
│   ├── components/  # Button, Link, TextField, PasswordField, Checkbox, SocialButton, Divider, Alert
│   ├── layout/      # AuthLayout (dos paneles) y BrandPanel
│   ├── navigation/  # NavigationProvider, useNavigation y rutas
│   └── features/    # login/ (LoginScreen, LoginForm, WelcomeView…) y register/ (RegisterScreen, RegisterForm…)
├── App.tsx
└── main.tsx         # Raíz de composición (inyección de dependencias)
```

Las pruebas viven junto al código (`*.test.ts(x)`). Cada caso se nombra con el escenario o
requisito que verifica (por ejemplo, `US2-1`, `FR-012`) para mantener la trazabilidad.

## Notas de diseño

- **Contraste (pendiente de aprobación de diseño):** varios colores de Figma no alcanzan
  WCAG 2.1 AA (botón 2.83:1, enlaces 3.56:1, textos secundarios 3.28:1, bordes 1.40:1). Se
  usan variantes más oscuras del mismo tono (`--brand-700`, `--neutral-600`, `--neutral-border`
  en `src/ui/styles/tokens.css`). Detalle en `specs/001-login-billetera/research.md` (R3).
- Los iconos de Google, Apple y del control de visibilidad son los marcadores de posición del
  diseño de Figma.
- Fuera de alcance: recuperar contraseña, acceso con Google/Apple, persistencia de
  "Recordarme", bloqueo por intentos fallidos, verificación de correo y detección de correos
  duplicados. Al activar los elementos no disponibles se muestra un aviso («Próximamente» en el
  registro).
