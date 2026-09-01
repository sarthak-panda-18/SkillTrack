'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const tokenParam = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenParam,
    },
  });

  useEffect(() => {
    if (tokenParam) {
      setValue('token', tokenParam);
    }
  }, [tokenParam, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(data.token, data.newPassword);
      setIsSuccess(true);
      toast.success('Password updated successfully! You can now log in.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired reset token');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Password Changed!</h3>
        <p className="text-xs text-zinc-500">
          Your account password has been updated. You can now log in to access your dashboard.
        </p>
        <Link href="/login" className="block pt-2">
          <Button className="w-full gap-2">
            Proceed to Login
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Password Reset Token"
        placeholder="Paste your reset token"
        {...register('token')}
        error={errors.token?.message}
      />

      <Input
        label="New Password"
        type="password"
        placeholder="••••••••"
        {...register('newPassword')}
        error={errors.newPassword?.message}
      />

      <Input
        label="Confirm New Password"
        type="password"
        placeholder="••••••••"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" size="lg" className="w-full gap-2 mt-2" isLoading={isLoading}>
        Update Password
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            Set your new password
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        <Card className="shadow-lg border-zinc-200/80 dark:border-zinc-800">
          <CardContent className="pt-6">
            <Suspense fallback={<div className="text-center py-6 text-xs text-zinc-500">Loading reset form...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800/80 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
