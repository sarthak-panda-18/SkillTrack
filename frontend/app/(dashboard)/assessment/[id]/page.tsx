'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Brain,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { assessmentService } from '@/services/assessment.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';

export default function AssessmentStartConfigPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['assessmentDetails', id],
    queryFn: () => assessmentService.getAssessmentById(id),
  });

  const startMutation = useMutation({
    mutationFn: () => assessmentService.startAssessment(id),
    onSuccess: (res) => {
      toast.success('Assessment started! Good luck!');
      router.push(`/assessment/take/${res.attemptId}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to start assessment.');
    },
  });

  if (isLoading) {
    return (
      <PageWrapper className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageWrapper>
    );
  }

  const assessment = data?.assessment;
  const skill = (assessment?.skillId as any) || {};

  return (
    <PageWrapper className="max-w-3xl mx-auto space-y-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900">
        <div className="bg-slate-900 dark:bg-slate-950 p-6 sm:p-8 text-white space-y-2">
          <Badge variant="default" className="bg-indigo-600 text-white font-bold text-xs border-0">
            {skill.category || 'Skill Assessment'}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{assessment?.title}</h1>
          <p className="text-slate-300 text-sm">{assessment?.description || `Evaluate your proficiency in ${skill.name || 'this skill'}.`}</p>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Questions</span>
              <strong className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                20 Questions
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Time Limit</span>
              <strong className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-slate-400" />
                {assessment?.timeLimit || 20} Mins
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Passing Score</span>
              <strong className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {assessment?.passingScore || 60}%
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Difficulty</span>
              <strong className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {assessment?.difficulty || 'MIXED'}
              </strong>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Assessment Guidelines & Rules:
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>The assessment contains <strong>exactly 20 conceptual multiple-choice questions</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>You have <strong>{assessment?.timeLimit || 20} minutes</strong> to complete all 20 questions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Unanswered questions upon timer expiry will be evaluated as incorrect.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Retaking the assessment will serve a new randomized 20-question combination.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              onClick={() => startMutation.mutate()}
              isLoading={startMutation.isPending}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6"
            >
              Start 20-Question Assessment Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
