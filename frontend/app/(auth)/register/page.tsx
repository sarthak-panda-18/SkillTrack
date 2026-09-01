'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CollegeSelect } from '@/components/ui/CollegeSelect';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    college: z.string().min(2, 'College selection is required'),
    degree: z.string().min(1, 'Degree is required'),
    branch: z.string().min(1, 'Branch is required'),
    graduationYear: z.coerce.number().min(2024, 'Graduation year must be 2024 or later'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      college: '',
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      graduationYear: new Date().getFullYear() + 1,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success('Account created successfully! Welcome to SkillTrack AI.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-lg space-y-6">
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
            Create your student account
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Start identifying skill gaps and building placement readiness.
          </p>
        </div>

        <Card className="shadow-lg border-zinc-200/80 dark:border-zinc-800">
          <CardContent className="pt-6 space-y-5">
            {/* Google Auth Button */}
            <GoogleAuthButton />

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 font-semibold uppercase relative">
                Or register with email
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Sarthak Sharma"
                {...register('name')}
                error={errors.name?.message}
              />

              <Input
                label="College / University Email"
                type="email"
                placeholder="sarthak@college.edu"
                {...register('email')}
                error={errors.email?.message}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
              </div>

              {/* Searchable Engineering College Selector */}
              <Controller
                name="college"
                control={control}
                render={({ field }) => (
                  <CollegeSelect
                    label="College / University Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.college?.message}
                  />
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Degree"
                  options={[
                    { label: 'B.Tech', value: 'B.Tech' },
                    { label: 'B.E.', value: 'B.E.' },
                    { label: 'M.Tech', value: 'M.Tech' },
                    { label: 'BCA', value: 'BCA' },
                    { label: 'MCA', value: 'MCA' },
                    { label: 'B.Sc Computer Science', value: 'B.Sc CS' },
                  ]}
                  {...register('degree')}
                  error={errors.degree?.message}
                />

                <Select
                  label="Graduation Year"
                  options={[
                    { label: '2024', value: 2024 },
                    { label: '2025', value: 2025 },
                    { label: '2026', value: 2026 },
                    { label: '2027', value: 2027 },
                    { label: '2028', value: 2028 },
                  ]}
                  {...register('graduationYear')}
                  error={errors.graduationYear?.message}
                />
              </div>

              <Select
                label="Branch / Major"
                options={[
                  { label: 'Computer Science & Engineering', value: 'Computer Science & Engineering' },
                  { label: 'Information Technology', value: 'Information Technology' },
                  { label: 'Electronics & Communication', value: 'Electronics & Communication' },
                  { label: 'Electrical Engineering', value: 'Electrical Engineering' },
                  { label: 'Data Science & AI', value: 'Data Science & AI' },
                  { label: 'Mechanical Engineering', value: 'Mechanical Engineering' },
                  { label: 'Other Engineering Branch', value: 'Other' },
                ]}
                {...register('branch')}
                error={errors.branch?.message}
              />

              <Button type="submit" size="lg" className="w-full gap-2 mt-2" isLoading={isLoading}>
                Create Account & Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800/80 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
