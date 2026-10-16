import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  // Las pruebas de navegación no deben depender del orden de ejecución (Constitución 1.4).
  window.history.replaceState(null, '', '/');
  document.title = '';
});
