import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Create account · Task board' };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
