import { AuthFormBase, type AuthFormProps } from './AuthFormBase';

export function LoginForm(props: AuthFormProps) {
  return <AuthFormBase mode="login" {...props} />;
}
