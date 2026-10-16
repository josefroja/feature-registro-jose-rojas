import type { MouseEvent, ReactNode } from 'react';
import { useNavigation } from '@/ui/navigation/useNavigation';
import type { Route } from '@/ui/navigation/routes';
import styles from './Link.module.css';

type LinkProps = {
  to: Route;
  children: ReactNode;
};

/** Enlace de navegación interna: navega sin recargar, salvo con teclas modificadoras o clic no principal. */
export function Link({ to, children }: LinkProps) {
  const { navigate } = useNavigation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const native =
      event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
    if (native) return;
    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} className={styles.link} onClick={handleClick}>
      {children}
    </a>
  );
}
