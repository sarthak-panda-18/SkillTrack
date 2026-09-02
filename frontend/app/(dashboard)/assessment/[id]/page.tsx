'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
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
        <Skeleton className="h-64 w-full rounded-sm bg-[#0A0A0A]" />
      </PageWrapper>
    );
  }

  const assessment = data?.assessment;
  const skill = (assessment?.skillId as any) || {};

  return (
    <PageWrapper className="max-w-3xl mx-auto space-y-6">
      <Card className="border-white/10 overflow-hidden bg-[#0A0A0A] text-white rounded-sm">
        <div className="bg-[#111111] p-6 sm:p-8 text-white space-y-2 border-b border-white/10">
          <Badge variant="default" className="bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40 font-mono font-bold text-xs uppercase">
            {skill.category || 'Skill Assessment'}
          </Badge>
          <h1 className="font-condensed text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">{assessment?.title}</h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans">{assessment?.description || `Evaluate your proficiency in ${skill.name || 'this skill'}.`}</p>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-sm bg-black border border-white/10 text-center font-mono">
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase">Questions</span>
              <strong className="font-condensed text-xl font-extrabold text-[#FFD400]">
                20 Questions
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase">Time Limit</span>
              <strong className="font-condensed text-xl font-extrabold text-white flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-zinc-400" />
                {assessment?.timeLimit || 20} Mins
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase">Passing Score</span>
              <strong className="font-condensed text-xl font-extrabold text-white">
                {assessment?.passingScore || 60}%
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase">Difficulty</span>
              <strong className="font-condensed text-xl font-extrabold text-white uppercase">
                {assessment?.difficulty || 'MIXED'}
              </strong>
            </div>
          </div>

          <div className="space-y-3 font-sans">
            <h3 className="font-condensed text-base font-bold text-white uppercase flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#FFD400]" />
              ASSESSMENT GUIDELINES & RULES:
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400 font-mono">
              <li className="flex items-start gap-2">
                <span className="text-[#FFD400] font-bold">•</span>
                <span>The assessment contains <strong className="text-white">exactly 20 conceptual multiple-choice questions</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD400] font-bold">•</span>
                <span>You have <strong className="text-white">{assessment?.timeLimit || 20} minutes</strong> to complete all 20 questions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD400] font-bold">•</span>
                <span>Unanswered questions upon timer expiry will be evaluated as incorrect.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD400] font-bold">•</span>
                <span>Retaking the assessment will serve a new randomized 20-question combination.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <Button
              onClick={() => startMutation.mutate()}
              isLoading={startMutation.isPending}
              className="gap-2 bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase px-6"
            >
              Start 20-Question Assessment Now
              <ArrowRight className="h-4 w-4 text-black" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

