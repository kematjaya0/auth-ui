// `defineAuthConfig`/`AuthConfig` are intentionally NOT re-exported here —
// this entry point also bundles the client components below, and importing
// config from here would pull `react-hook-form` into edge/middleware/server
// bundles that only need config. Import config from '@kematjaya/auth-ui/config'.
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
