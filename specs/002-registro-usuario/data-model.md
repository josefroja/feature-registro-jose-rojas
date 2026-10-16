# Data Model: Pantalla de Registro de Usuarios de KynWallet

**Feature**: `002-registro-usuario` | **Date**: 2026-10-16

Sin persistencia: todas las entidades viven en memoria. La contraseña nunca se registra, se
persiste ni se incluye en resultados.

## RegistrationData (dominio, valor)

Datos del formulario.

| Campo | Tipo | Reglas (FR) | Mensaje |
|---|---|---|---|
| `fullName` | string | Vacío tras `trim` (FR-004) | «Ingresa tu nombre completo» |
| | | > 100 caracteres | «El nombre no puede superar 100 caracteres» |
| `email` | string | Vacío tras `trim` (FR-005) | «Ingresa tu correo electrónico» |
| | | Formato inválido o > 254 caracteres | «Ingresa un correo electrónico válido» |
| `password` | string | Vacío (FR-006) | «Ingresa tu contraseña» |
| | | < 8 caracteres | «La contraseña debe tener al menos 8 caracteres» |
| | | > 128 caracteres | «La contraseña no puede superar 128 caracteres» |
| `confirmPassword` | string | Vacío (FR-007) | «Confirma tu contraseña» |
| | | Distinta de `password` (comparación exacta) | «Las contraseñas no coinciden» |
| `acceptedTerms` | boolean | `false` (FR-003) | «Debes aceptar los términos y condiciones» |

- `validateRegistration(data) → RegistrationErrors` es una función pura; `{}` significa válido.
- Los espacios de la contraseña se respetan; nombre y correo se recortan.
- Si `password` es inválida, el error de coincidencia no se muestra sobre la confirmación
  hasta que la contraseña sea válida (evita dos mensajes por la misma causa).

## RegistrationErrors (dominio)

`Partial<Record<'fullName' | 'email' | 'password' | 'confirmPassword' | 'acceptedTerms', string>>`

## NewAccount (dominio, valor)

Lo que recibe el puerto una vez validado.

| Campo | Tipo | Notas |
|---|---|---|
| `fullName` | string | Recortado |
| `email` | string | Normalizado (trim + minúsculas) |
| `password` | string | Tal cual; no se registra |

## RegistrationResult (dominio, unión discriminada)

| Variante | Datos | Origen |
|---|---|---|
| `success` | — | El puerto aceptó el registro (en la demo, siempre) |
| `invalid` | `errors: RegistrationErrors` | El caso de uso detectó datos inválidos; **no** se llamó al puerto |
| `unavailable` | — | El puerto falló o lanzó una excepción (FR-013) |

## RegisterFormState (UI, máquina de estados)

```text
               submit (con errores)
          ┌───────────────────────────┐
          ▼                           │
   ┌────────────┐  submit (válido)  ┌─┴──────────┐
   │  editing   │ ────────────────► │ submitting │
   └────────────┘                   └─────┬──────┘
          ▲                               │
          │   change (cualquier campo)    │ result: unavailable
          │                         ┌─────▼──────┐
          └──────────────────────── │   failed   │
                                    └────────────┘
 result: success → se invoca onRegistered(); el formulario se desmonta al navegar
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | `'editing' \| 'submitting' \| 'failed'` | `submit` en `submitting` se ignora (FR-011) |
| `values` | `Record<'fullName'\|'email'\|'password'\|'confirmPassword', string>` | |
| `acceptedTerms` | boolean | |
| `touched` | `Record<campo, boolean>` | Marcado en `blur` y al enviar |
| `fieldErrors` | `RegistrationErrors` | Solo errores de campos tocados |
| `submitAttempted` | boolean | Habilita mostrar el error de términos |
| `notice` | string \| null | Aviso «Próximamente»; uno a la vez |

Transiciones relevantes: `failed` conserva `fullName` y `email`, vacía `password` y
`confirmPassword`; editar cualquier campo en `failed` vuelve a `editing` sin mensaje global;
`submit` válido limpia `notice`.

## NavigationState (UI)

| Campo | Tipo | Notas |
|---|---|---|
| `path` | `'/login' \| '/registro'` | Ruta resuelta de `window.location.pathname` |
| `flash` | `'registered' \| null` | Aviso de un solo uso; **solo memoria** |

**Invariantes**: `flash` se limpia en cualquier `navigate` o `popstate` posterior; no se
escribe en la URL, `history.state` ni almacenamiento; no contiene datos personales.

## RegistrationGateway (puerto)

Ver [contracts/registration-gateway.md](./contracts/registration-gateway.md).
