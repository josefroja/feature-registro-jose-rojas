# Contract: RegistrationGateway (puerto de registro)

Interfaz entre la capa de aplicación y la infraestructura (Constitución 2.5, 3.4). La UI recibe el
caso de uso por inyección desde `src/main.tsx` y nunca conoce el adaptador concreto.

> **No existe un backend de registro** (verificado en el repositorio). Este contrato define lo
> que cualquier adaptador DEBE cumplir; **no define endpoints, URL ni formato de red**. Esos
> datos deberán provenir de la especificación del servicio real (BRD/ARD) cuando exista.

```ts
// src/application/ports/RegistrationGateway.ts
export interface RegistrationGateway {
  register(account: NewAccount): Promise<RegistrationResult>;
}

// src/domain/registration.ts
export type NewAccount = { fullName: string; email: string; password: string };
export type RegistrationResult =
  | { kind: 'success' }
  | { kind: 'invalid'; errors: RegistrationErrors } // solo lo produce el caso de uso
  | { kind: 'unavailable' };
```

## Comportamiento obligatorio de toda implementación del puerto

| # | Dado | Resultado |
|---|---|---|
| R1 | Cuenta válida aceptada | `success` |
| R2 | Servicio no disponible o error interno | `unavailable`; la promesa NO DEBE rechazarse |
| R3 | Cualquier caso | NO DEBE registrar la contraseña ni incluirla en el resultado (5.3, 5.4) |

## Caso de uso: `createRegister(gateway)` → `Register`

```ts
export type Register = (data: RegistrationData) => Promise<RegistrationResult>;
```

| # | Dado | Resultado |
|---|---|---|
| U1 | Datos con algún error de validación | `{ kind: 'invalid', errors }`; el puerto NO se invoca |
| U2 | Datos válidos | Llama a `gateway.register` con nombre recortado y correo normalizado y devuelve su resultado |
| U3 | El puerto lanza una excepción | `{ kind: 'unavailable' }` |

## Implementación de la demostración: `SimulatedRegistrationGateway`

```ts
new SimulatedRegistrationGateway(options?: { delayMs?: number })
```

- **Es una simulación**: espera `delayMs` (1000 por defecto; las pruebas usan 0 o temporizadores
  falsos) y devuelve `success`. No realiza peticiones de red, no persiste ni registra datos.
- La cabecera del archivo y el README declaran esta limitación (FR-021).
- La cuenta «creada» **no queda disponible para iniciar sesión**.

## Sustitución futura

Un adaptador real implementa `RegistrationGateway`, se instancia en `main.tsx` y reemplaza al
simulado. Dominio, caso de uso y UI no cambian. Mapeo de errores del servicio a
`success`/`unavailable` es responsabilidad del adaptador.
