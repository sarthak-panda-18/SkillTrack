'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('Welcome back to SkillTrack AI!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100">
              SkillTrack <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Sign in to your account
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Access your student or administrator workspace.
          </p>
        </div>

        <Card className="shadow-lg border-zinc-200/80 dark:border-zinc-800">
          <CardContent className="pt-6 space-y-5">
            {/* Google OAuth Component */}
            <GoogleAuthButton />

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 font-semibold uppercase relative">
                Or continue with email
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="sarthak@college.edu"
                {...register('email')}
                error={errors.email?.message}
              />

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Password</span>
                  <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                />
              </div>

              <Button type="submit" size="lg" className="w-full gap-2 mt-2" isLoading={isLoading}>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800/80 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Don't have an account yet?{' '}
              <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
