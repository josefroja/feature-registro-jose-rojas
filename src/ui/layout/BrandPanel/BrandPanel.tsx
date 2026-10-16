import type { ReactNode } from 'react';
import logoDot from '@/ui/assets/logo-dot.svg';
import logoDot2 from '@/ui/assets/logo-dot-2.svg';
import logoMark from '@/ui/assets/logo-mark.svg';
import styles from './BrandPanel.module.css';

type BrandPanelProps = {
  title?: ReactNode;
  description?: string;
  /** `register` aplica el degradado y la posición del titular del frame «04 · Registro». */
  variant?: 'login' | 'register';
  /** Oculta el panel por debajo de 768 px; solo se muestra el formulario. */
  hideOnMobile?: boolean;
};

const LOGIN_TITLE = (
  <>
    Tu dinero,
    <br />
    sin fronteras.
  </>
);
const LOGIN_DESCRIPTION =
  'Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.';

/** Panel de marca del diseño (Figma, nodos 2:3 y 31:3). */
export function BrandPanel({
  title = LOGIN_TITLE,
  description = LOGIN_DESCRIPTION,
  variant = 'login',
  hideOnMobile = false,
}: BrandPanelProps) {
  return (
    <header
      className={styles.panel}
      data-variant={variant}
      data-hide-on-mobile={hideOnMobile ? 'true' : undefined}
    >
      <div className={styles.logo}>
        {variant === 'register' ? (
          // Frame 04: dos formas superpuestas (Figma 31:4 y 31:5), distintas del logo del frame 01.
          <span className={styles.logoDots} aria-hidden="true">
            <img src={logoDot} alt="" width={10} height={28} className={styles.logoDot} />
            <img src={logoDot2} alt="" width={14} height={14} className={styles.logoDot2} />
          </span>
        ) : (
          <img src={logoMark} alt="" width={20} height={44} />
        )}
        <span className={styles.logoText}>KynWallet</span>
      </div>
      <div className={styles.headline}>
        <p className={styles.title}>{title}</p>
        <p className={styles.subtitle}>{description}</p>
      </div>
      <div className={styles.card} aria-hidden="true">
        <div className={styles.cardTop}>
          <span className={styles.cardName}>Kyn Card</span>
          <span className={styles.chip} />
        </div>
        <span className={styles.cardNumber}>{'5294  ••••  ••••  4827'}</span>
        <div className={styles.cardBottom}>
          <span className={styles.cardHolder}>STEVEN LUNA</span>
          <span className={styles.cardExpiry}>12/29</span>
        </div>
      </div>
    </header>
  );
}
