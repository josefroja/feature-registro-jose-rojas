import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';

type AuthLayoutProps = {
  /** Panel de marca (p. ej. `BrandPanel`); su visibilidad en móvil la decide el propio panel. */
  brand: ReactNode;
  /** `top` ancla el formulario arriba (frame «04 · Registro», y = 140) en vez de centrarlo. */
  formAlign?: 'center' | 'top';
  children: ReactNode;
};

/** Layout de dos paneles compartido por las pantallas de acceso (login y registro). */
export function AuthLayout({ brand, formAlign = 'center', children }: AuthLayoutProps) {
  return (
    <div className={styles.screen}>
      {brand}
      <main className={styles.formPanel} data-form-align={formAlign === 'top' ? 'top' : undefined}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
