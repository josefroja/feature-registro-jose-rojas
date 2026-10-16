# Contract: UI de la pantalla de registro

Contrato observable (lo que pruebas, revisión visual y tecnologías de asistencia pueden ver).
Referencia visual: Figma `04 · Registro` (nodo `31:2`); medidas en research R7.

## Estructura (escritorio, ≥ 960 px)

```text
AuthLayout
├── BrandPanel (variant="register")  → <header>; logo, titular, subtexto, tarjeta (aria-hidden)
└── <main>
    └── <form noValidate>
        ├── <h1>Crea tu cuenta</h1> + <p>Completa tus datos para comenzar</p>
        ├── Nombre completo        (TextField, name="fullName", autoComplete="name")
        ├── Correo electrónico     (TextField type="email", name="email", autoComplete="email")
        ├── Contraseña             (PasswordField, name="password", autoComplete="new-password")
        ├── Confirmar contraseña   (PasswordField, name="confirmPassword", autoComplete="new-password")
        ├── Checkbox «Acepto los términos y condiciones» (enlace «términos y condiciones»)
        ├── [Alert error]  fallo de registro (role="alert")
        ├── Button «Crear cuenta» (type="submit", estado de carga «Creando cuenta…»)
        ├── Divider «o regístrate con»
        ├── SocialButton Google · SocialButton Apple
        ├── [Alert info]   «Próximamente» (role="status"), uno a la vez
        └── Pie: «¿Ya tienes cuenta?» + Link «Inicia sesión» → /login
```

## Textos y placeholders (Figma)

| Elemento | Texto |
|---|---|
| Placeholders | «Ej: Diego Martínez», «tucorreo@ejemplo.com», «••••••••», «••••••••» |
| Titular del panel | «Comienza tu camino financiero.» |
| Subtexto del panel | «Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.» |
| Tarjeta | «Kyn Card», «5294  ••••  ••••  4827», «STEVEN LUNA», «12/29» |

## Accesibilidad (FR-019, FR-020)

- Cada campo con `<label>` asociado; error con `aria-invalid="true"` y `aria-describedby` hacia
  su mensaje (`TextField`; `Checkbox` con la misma convención).
- Cada `PasswordField` tiene su control con `aria-pressed` y `aria-label`
  «Mostrar contraseña» / «Ocultar contraseña»; el estado de uno no afecta al otro.
- Orden de foco: nombre → correo → contraseña → ver → confirmación → ver → términos
  (checkbox, luego enlace) → «Crear cuenta» → Google → Apple → «Inicia sesión».
- Envío con errores: foco al primer campo con error, en el mismo orden.
- Mensajes globales: error de registro `role="alert"`; avisos «Próximamente» y éxito `role="status"`.
- Foco visible en todos los controles (`--focus-ring`); contraste AA con los tokens accesibles.
- `axe` sin violaciones en: vacío, con errores y con aviso «Próximamente».

## Estados

| Estado | Comportamiento visible |
|---|---|
| `editing` | Formulario con errores por campo según reglas de `data-model.md` |
| `submitting` | Botón con `aria-busy`, texto «Creando cuenta…», deshabilitado; campos conservan valores |
| `failed` | Alert «No pudimos crear tu cuenta. Intenta más tarde.»; nombre y correo conservados; contraseñas vacías |
| Éxito | Navega a `/login` con aviso de éxito |

## Responsive

| Ancho | Resultado |
|---|---|
| < 768 px | Sin panel de marca; solo el formulario; sin scroll horizontal desde 320 px |
| 768–959 px | Franja con logo + formulario |
| ≥ 960 px | Dos paneles (marca 43 %; fija en 620 px desde 1280 px) |

El componente expone el modo mediante `data-hide-on-mobile` y `data-variant` en el panel de marca,
lo que permite probar de forma automatizada que el modo correcto está activo.

## Aviso de éxito en `/login`

`Alert tone="success"` con `role="status"` y el texto «Cuenta creada correctamente. Ya puedes
iniciar sesión», encima del formulario de login. Sin datos personales.
