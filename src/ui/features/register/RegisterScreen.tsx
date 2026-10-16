import type { Register } from '@/application/register';
import { AuthLayout } from '@/ui/layout/AuthLayout/AuthLayout';
import { BrandPanel } from '@/ui/layout/BrandPanel/BrandPanel';
import { RegisterForm } from './RegisterForm';

type RegisterScreenProps = {
  register: Register;
  onRegistered: () => void;
};

export function RegisterScreen({ register, onRegistered }: RegisterScreenProps) {
  return (
    <AuthLayout
      formAlign="top"
      brand={
        <BrandPanel
          variant="register"
          hideOnMobile
          title={
            <>
              Comienza tu
              <br />
              camino financiero.
            </>
          }
          description="Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar."
        />
      }
    >
      <RegisterForm register={register} onRegistered={onRegistered} />
    </AuthLayout>
  );
}
