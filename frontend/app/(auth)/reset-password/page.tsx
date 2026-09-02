'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Zap, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
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

import { ThemeToggle } from '@/components/layout/ThemeToggle';

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
        <div className="h-12 w-12 rounded-sm bg-[#FFD400]/10 border border-[#FFD400]/40 text-[#FFD400] flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-condensed font-bold text-foreground text-xl uppercase">PASSWORD CHANGED!</h3>
        <p className="text-xs text-muted-foreground">
          Your account password has been updated. You can now log in to access your dashboard.
        </p>
        <Link href="/login" className="block pt-2">
          <Button className="w-full gap-2 bg-[#FFD400] text-black font-extrabold uppercase hover:bg-yellow-hover dark:hover:bg-[#FFE033]">
            PROCEED TO LOGIN
            <ArrowRight className="h-4 w-4 text-black" />
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

      <Button type="submit" size="lg" className="w-full gap-2 mt-2 bg-[#FFD400] text-black font-extrabold uppercase hover:bg-yellow-hover dark:hover:bg-[#FFE033]" isLoading={isLoading}>
        UPDATE PASSWORD
        <ArrowRight className="h-4 w-4 text-black" />
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-background text-foreground relative transition-colors duration-200 selection:bg-[#FFD400] selection:text-black">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="h-10 w-10 rounded-sm bg-[#FFD400] flex items-center justify-center text-black shadow-md font-bold">
              <Zap className="h-5 w-5 fill-black text-black" />
            </div>
            <span className="font-condensed font-black text-3xl uppercase tracking-wider text-foreground">
              SKILLTRACK <span className="text-[#FFD400]">AI</span>
            </span>
          </Link>
          <h2 className="mt-3 font-condensed font-extrabold text-2xl uppercase tracking-wider text-foreground">
            SET YOUR NEW PASSWORD
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        <Card className="border border-border bg-card rounded-sm shadow-2xl">
          <CardContent className="pt-6">
            <Suspense fallback={<div className="text-center py-6 text-xs text-muted-foreground font-mono">Loading reset form...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border py-4 bg-surface-secondary rounded-b-sm">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-muted-foreground hover:text-[#FFD400]">
              <ArrowLeft className="h-3.5 w-3.5" />
              BACK TO LOGIN
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

