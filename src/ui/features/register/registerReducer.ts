import type { RegistrationErrors, RegistrationField } from '@/domain/registration';
import { validateRegistration } from '@/domain/registrationValidation';

export type TextField = Exclude<RegistrationField, 'acceptedTerms'>;

export type RegisterState = {
  status: 'editing' | 'submitting' | 'failed';
  values: Record<TextField, string>;
  acceptedTerms: boolean;
  touched: Record<TextField, boolean>;
  fieldErrors: RegistrationErrors;
  submitAttempted: boolean;
  notice: string | null;
};

export type RegisterAction =
  | { type: 'change'; field: TextField; value: string }
  | { type: 'blur'; field: TextField }
  | { type: 'toggleTerms'; checked: boolean }
  | { type: 'showNotice'; message: string }
  | { type: 'submit' }
  | { type: 'failed' };

export const initialRegisterState: RegisterState = {
  status: 'editing',
  values: { fullName: '', email: '', password: '', confirmPassword: '' },
  acceptedTerms: false,
  touched: { fullName: false, email: false, password: false, confirmPassword: false },
  fieldErrors: {},
  submitAttempted: false,
  notice: null,
};

const TEXT_FIELDS: TextField[] = ['fullName', 'email', 'password', 'confirmPassword'];

/** Errores visibles: campos tocados; el de términos solo tras intentar enviar (FR-010). */
function visibleErrors(
  values: RegisterState['values'],
  acceptedTerms: boolean,
  touched: RegisterState['touched'],
  submitAttempted: boolean,
): RegistrationErrors {
  const errors = validateRegistration({ ...values, acceptedTerms });
  const visible: RegistrationErrors = {};
  for (const field of TEXT_FIELDS) {
    const error = errors[field];
    if (touched[field] && error) visible[field] = error;
  }
  if (submitAttempted && errors.acceptedTerms) visible.acceptedTerms = errors.acceptedTerms;
  return visible;
}

/** Máquina de estados del formulario (data-model.md, RegisterFormState). */
export function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case 'change': {
      const values = { ...state.values, [action.field]: action.value };
      return {
        ...state,
        status: state.status === 'failed' ? 'editing' : state.status,
        values,
        fieldErrors: visibleErrors(
          values,
          state.acceptedTerms,
          state.touched,
          state.submitAttempted,
        ),
      };
    }
    case 'blur': {
      const touched = { ...state.touched, [action.field]: true };
      return {
        ...state,
        touched,
        fieldErrors: visibleErrors(
          state.values,
          state.acceptedTerms,
          touched,
          state.submitAttempted,
        ),
      };
    }
    case 'toggleTerms':
      return {
        ...state,
        acceptedTerms: action.checked,
        fieldErrors: visibleErrors(
          state.values,
          action.checked,
          state.touched,
          state.submitAttempted,
        ),
      };
    case 'showNotice':
      return { ...state, notice: action.message };
    case 'submit': {
      if (state.status === 'submitting') return state;
      const touched = { fullName: true, email: true, password: true, confirmPassword: true };
      const fieldErrors = visibleErrors(state.values, state.acceptedTerms, touched, true);
      // FR-009: no se registra mientras existan errores de validación.
      const status = Object.keys(fieldErrors).length > 0 ? 'editing' : 'submitting';
      return { ...state, status, touched, submitAttempted: true, fieldErrors, notice: null };
    }
    case 'failed':
      return {
        ...state,
        status: 'failed',
        values: { ...state.values, password: '', confirmPassword: '' },
      };
  }
}
