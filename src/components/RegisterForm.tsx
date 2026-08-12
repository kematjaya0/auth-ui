import { AuthFormBase, type AuthFormProps } from './AuthFormBase';

export function RegisterForm(props: AuthFormProps) {
  return <AuthFormBase mode="register" {...props} />;
}
