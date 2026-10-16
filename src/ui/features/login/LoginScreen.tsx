import type { ReactNode } from 'react';
import { AuthLayout } from '@/ui/layout/AuthLayout/AuthLayout';
import { BrandPanel } from '@/ui/layout/BrandPanel/BrandPanel';

export function LoginScreen({ children }: { children: ReactNode }) {
  return <AuthLayout brand={<BrandPanel />}>{children}</AuthLayout>;
}
