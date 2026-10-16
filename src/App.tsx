import type { Authenticate } from '@/application/authenticate';
import type { Register } from '@/application/register';
import { MESSAGES } from '@/domain/messages';
import { LoginForm } from '@/ui/features/login/LoginForm';
import { LoginScreen } from '@/ui/features/login/LoginScreen';
import { RegisterScreen } from '@/ui/features/register/RegisterScreen';
import { NavigationProvider } from '@/ui/navigation/NavigationProvider';
import { ROUTES } from '@/ui/navigation/routes';
import { useNavigation } from '@/ui/navigation/useNavigation';

type AppProps = {
  authenticate: Authenticate;
  register: Register;
};

function Routes({ authenticate, register }: AppProps) {
  const { path, flash, navigate } = useNavigation();

  if (path === ROUTES.register) {
    return (
      <RegisterScreen
        register={register}
        onRegistered={() => navigate(ROUTES.login, { flash: 'registered' })}
      />
    );
  }
  return (
    <LoginScreen>
      <LoginForm
        authenticate={authenticate}
        successMessage={flash === 'registered' ? MESSAGES.REGISTER_SUCCESS : undefined}
      />
    </LoginScreen>
  );
}

export function App(props: AppProps) {
  return (
    <NavigationProvider>
      <Routes {...props} />
    </NavigationProvider>
  );
}
