'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { authService } from '@/services/auth.service';

import { ThemeToggle } from '@/components/layout/ThemeToggle';

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
            <span className="font-bold text-3xl uppercase tracking-wider text-foreground">
              SKILLTRACK <span className="text-[#FFD400]">AI</span>
            </span>
          </Link>
          <h2 className="mt-3 font-extrabold text-2xl uppercase tracking-wider text-foreground">
            RESET YOUR PASSWORD
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Enter your registered email address to receive password recovery steps.
          </p>
        </div>

        <Card className="border border-border bg-card rounded-sm shadow-2xl">
          <CardContent className="pt-6">
            {isSubmitted ? (
              <div className="text-center py-4 space-y-3">
                <div className="h-12 w-12 rounded-sm bg-[#FFD400]/10 border border-[#FFD400]/40 text-[#FFD400] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-xl uppercase">CHECK YOUR INBOX</h3>
                <p className="text-xs text-muted-foreground">
                  We've sent a password reset link to <span className="font-mono font-bold text-[#FFD400]">{email}</span>.
                </p>
                <Button variant="secondary" className="w-full mt-4 font-mono text-xs uppercase" onClick={() => setIsSubmitted(false)}>
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

                <Button type="submit" size="lg" variant="primary" className="w-full gap-2 mt-2 font-bold uppercase" isLoading={isLoading}>
                  SEND RESET LINK
                </Button>
              </form>
            )}
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

