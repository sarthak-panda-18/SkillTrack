'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Sparkles, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';

import { authService } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const msg = await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success(msg);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Unable to process reset request. Please try again.');
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
            Reset your password
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Enter your registered email address to receive password recovery steps.
          </p>
        </div>

        <Card className="shadow-lg border-zinc-200/80 dark:border-zinc-800">
          <CardContent className="pt-6">
            {isSubmitted ? (
              <div className="text-center py-4 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Check your inbox</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  We've sent a password reset link to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{email}</span>.
                </p>
                <Button variant="outline" className="w-full mt-4" onClick={() => setIsSubmitted(false)}>
                  Send again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="sarthak@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button type="submit" size="lg" className="w-full gap-2 mt-2" isLoading={isLoading}>
                  Send Password Reset Link
                </Button>
              </form>
            )}
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
