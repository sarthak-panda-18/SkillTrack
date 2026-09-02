'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Zap, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-black text-white selection:bg-[#FFD400] selection:text-black">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="h-10 w-10 rounded-sm bg-[#FFD400] flex items-center justify-center text-black shadow-md font-bold">
              <Zap className="h-5 w-5 fill-black text-black" />
            </div>
            <span className="font-condensed font-black text-3xl uppercase tracking-wider text-white">
              SKILLTRACK <span className="text-[#FFD400]">AI</span>
            </span>
          </Link>
          <h2 className="mt-3 font-condensed font-extrabold text-2xl uppercase tracking-wider text-white">
            SIGN IN TO YOUR ACCOUNT
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Access your student or administrator workspace.
          </p>
        </div>

        <Card className="border border-white/15 bg-[#0A0A0A] rounded-sm shadow-2xl">
          <CardContent className="pt-6 space-y-5">
            {/* Google OAuth Component */}
            <GoogleAuthButton />

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className="bg-[#0A0A0A] px-3 text-[10px] text-zinc-400 font-mono font-bold uppercase relative">
                OR CONTINUE WITH EMAIL
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
                  <span className="text-xs font-mono font-bold uppercase text-zinc-300">Password</span>
                  <Link href="/forgot-password" className="text-xs font-mono font-bold text-[#FFD400] hover:underline">
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

              <Button type="submit" size="lg" className="w-full gap-2 mt-2 bg-[#FFD400] text-black font-extrabold uppercase hover:bg-[#FFE033]" isLoading={isLoading}>
                SIGN IN
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-white/10 py-4 bg-[#111111] rounded-b-sm">
            <p className="text-xs text-zinc-400 font-sans">
              Don't have an account yet?{' '}
              <Link href="/register" className="font-bold text-[#FFD400] hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

