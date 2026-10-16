# Quickstart: validar el registro

**Feature**: `002-registro-usuario` | Requisitos: Node.js ≥ 20, `npm install` hecho y `.env.local`
configurado según el README (necesario para que el login funcione; el registro no lo usa).

> El registro es una **simulación solo-cliente**: no existe backend, no se persiste nada y la
> cuenta «creada» no puede iniciar sesión. Ver [contracts/registration-gateway.md](./contracts/registration-gateway.md).

## 1. Controles automáticos

```bash
npm run test          # todas las pruebas
npm run verify        # lint, formato, tipos, cobertura, build, auditorías y secretos
```

Esperado: todo en verde; cobertura global ≥ 80 % y sin disminuir respecto a la rama base.
Las pruebas llevan el ID del escenario (`US1-1`, `FR-007`, …) para trazabilidad con la spec.

## 2. Recorrido manual (`npm run dev` → <http://localhost:5173>)

| # | Acción | Resultado esperado |
|---|---|---|
| 1 | Abrir `/registro` | Dos paneles, textos del frame 04 |
| 2 | Pulsar «Crear cuenta» vacío | 5 mensajes (nombre, correo, contraseña, confirmación, términos); foco en «Nombre completo» |
| 3 | Escribir `usuario@` y salir del campo | «Ingresa un correo electrónico válido» sin enviar |
| 4 | Contraseña de 7 caracteres | «La contraseña debe tener al menos 8 caracteres» |
| 5 | Confirmación distinta | «Las contraseñas no coinciden»; desaparece al igualarlas |
| 6 | Activar los dos ojos | Se muestran u ocultan de forma independiente |
| 7 | Pulsar Google y luego Apple | Un único aviso «Próximamente» |
| 8 | Completar datos válidos + términos → «Crear cuenta» | Botón en carga ~1 s; redirige a `/login` con aviso de éxito |
| 9 | Recargar `/login` | Sin aviso de éxito |
| 10 | En `/login` pulsar «Regístrate»; en `/registro` pulsar «Inicia sesión» | Navegación entre pantallas; botón Atrás coherente |
| 11 | Abrir `/`, `/xyz` | Redirigen a `/login` |

## 3. Responsive y fidelidad visual (evidencia de T-RSP-01 y T-VIS-01)

Con las DevTools, probar 320, 375, 768, 1024 y 1440 px:

- 320/375: solo formulario, sin scroll horizontal, botones sociales legibles.
- 768: franja de logo + formulario.
- 1024/1440: dos paneles; a 1440 px comparar con el frame `04 · Registro` (medidas de research R7).

Registrar capturas o notas de cualquier diferencia y de las desviaciones de contraste aprobadas.

## 4. Accesibilidad

- Recorrer todo el formulario solo con teclado (Tab/Shift+Tab, Espacio en la casilla, Enter para enviar).
- Verificar que lectores de pantalla anuncian errores, el aviso «Próximamente» y el aviso de éxito.
- `axe` automatizado ya forma parte de `npm test`.

## 5. Documentación (T-DOC-01)

Confirmar que el README indica: rutas, registro simulado **sin backend**, y el requisito de
*fallback* a `index.html` para hosting estático.
