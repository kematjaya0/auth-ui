export {
  defineAuthConfig,
  type AuthConfig,
  type DefineAuthConfigInput
} from './config';
export type { Problem, TokenPair, UserProfile } from './types';
export {
  authSchema,
  changePasswordSchema,
  type AuthFormValues,
  type ChangePasswordFormValues
} from './schemas';

export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export type { AuthFormProps } from './components/AuthFormBase';
export { ProfileView, type ProfileViewProps } from './components/ProfileView';
export {
  ChangePasswordForm,
  type ChangePasswordFormProps
} from './components/ChangePasswordForm';
export { LoginToast } from './components/LoginToast';
