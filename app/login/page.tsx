import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Sign in · Task board' };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
