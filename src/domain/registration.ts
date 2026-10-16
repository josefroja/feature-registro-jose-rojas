export type RegistrationData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export type RegistrationField = keyof RegistrationData;

export type RegistrationErrors = Partial<Record<RegistrationField, string>>;

/** Lo que recibe el puerto de registro una vez validado. */
export type NewAccount = {
  fullName: string;
  email: string;
  password: string;
};

export type RegistrationResult =
  { kind: 'success' } | { kind: 'invalid'; errors: RegistrationErrors } | { kind: 'unavailable' };
